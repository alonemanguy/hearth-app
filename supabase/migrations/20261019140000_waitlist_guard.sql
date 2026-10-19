-- Hearth: put a guard on the waitlist, the one table anybody can write to
-- without an account.
--
-- It accepted any text at any rate. Now a before insert trigger tidies the
-- address, refuses it unless it looks like an email address, and caps how many
-- signups one client can add. The check constraint holds the same format rule
-- for anything that writes to the table directly.

-- 1. Attempts, keyed by client address -----------------------------

create table if not exists public.waitlist_attempts (
  id uuid not null default gen_random_uuid(),
  request_ip text not null,
  attempted_at timestamp with time zone not null default now()
);

alter table only public.waitlist_attempts drop constraint if exists waitlist_attempts_pkey;
alter table only public.waitlist_attempts add constraint waitlist_attempts_pkey primary key (id);

create index if not exists idx_waitlist_attempts_ip_time on public.waitlist_attempts (request_ip, attempted_at desc);

alter table public.waitlist_attempts enable row level security;

-- Nothing reaches this table through the API: the trigger writes to it as the
-- owner and no policy is defined for anyone else.
revoke all on public.waitlist_attempts from anon, authenticated;
grant select on public.waitlist_attempts to service_role;

-- 2. Email format --------------------------------------------------

alter table public.waitlist drop constraint if exists waitlist_email_check;
alter table public.waitlist add constraint waitlist_email_check check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and length(email) <= 254);

-- 3. The guard -----------------------------------------------------

create or replace function public.guard_waitlist_signup()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_headers jsonb := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_ip text;
  v_hour int;
  v_day int;
  v_per_hour constant int := 10;
  v_per_day constant int := 30;
begin
  new.email := lower(trim(coalesce(new.email, '')));

  if new.email = '' or length(new.email) > 254 or new.email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'A valid email address is required.';
  end if;

  -- An address that is already on the list is left to the unique constraint, so
  -- a repeat submission keeps getting the client's already-on-the-list answer
  -- and never counts against the limits below.
  if exists (select 1 from waitlist where email = new.email) then
    return new;
  end if;

  -- Only requests that came in over the API are counted. The dashboard and the
  -- service role can still write rows.
  if coalesce(current_setting('request.jwt.claims', true), '') = '' then
    return new;
  end if;

  -- The edge appends the address it saw to the end of x-forwarded-for, so the
  -- last entry is the one a caller cannot choose. cf-connecting-ip is the
  -- fallback.
  v_ip := nullif(trim(substring(coalesce(v_headers ->> 'x-forwarded-for', '') from '[^,]+$')), '');
  if v_ip is null then
    v_ip := nullif(trim(coalesce(v_headers ->> 'cf-connecting-ip', '')), '');
  end if;
  if v_ip is null then
    return new;
  end if;

  delete from waitlist_attempts
   where request_ip = v_ip
     and attempted_at < now() - interval '1 day';

  select count(*) into v_hour from waitlist_attempts
   where request_ip = v_ip
     and attempted_at > now() - interval '1 hour';

  select count(*) into v_day from waitlist_attempts
   where request_ip = v_ip
     and attempted_at > now() - interval '1 day';

  if v_hour >= v_per_hour or v_day >= v_per_day then
    raise exception 'Too many waitlist signups from this network. Please try again later.';
  end if;

  insert into waitlist_attempts (request_ip) values (v_ip);

  return new;
end;
$function$;

create or replace trigger guard_waitlist_signup
  before insert on public.waitlist
  for each row execute function public.guard_waitlist_signup();

-- Only the trigger runs this.
revoke execute on function public.guard_waitlist_signup() from public, anon, authenticated;
