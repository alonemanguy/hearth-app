-- Hearth: baseline schema
--
-- This is the database as it existed when the repo went public. It was
-- generated from the live project catalog (pg_catalog and
-- information_schema) rather than hand written, so it describes what the
-- app actually runs against.
--
-- Applying it to a fresh Supabase project reproduces the backend: tables,
-- keys, indexes, functions, triggers, row level security and policies.
--
-- Extensions are created without pinned versions so this keeps working on
-- newer Supabase images, and keys are added before foreign keys so the whole
-- file applies in a single pass.

-- Extensions -----------------------------------------------------

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema public;
create extension if not exists pg_stat_statements with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists plpgsql with schema pg_catalog;
create extension if not exists supabase_vault with schema vault;
create extension if not exists "uuid-ossp" with schema extensions;

-- Tables ---------------------------------------------------------

create table if not exists public.appliances (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  property_id uuid,
  name text not null,
  category text default 'appliance'::text,
  make text,
  model text,
  serial_number text,
  purchase_date date,
  install_date date,
  warranty_expires_at date,
  lifespan_years integer,
  manual_url text,
  receipt_url text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  household_id uuid
);

create table if not exists public.household_members (
  household_id uuid not null,
  user_id uuid not null,
  role text default 'member'::text,
  joined_at timestamp with time zone default now()
);

create table if not exists public.households (
  id uuid not null default gen_random_uuid(),
  name text not null,
  invite_code text not null,
  created_by uuid,
  created_at timestamp with time zone default now(),
  invite_code_expires_at timestamp with time zone default (now() + '30 days'::interval)
);

create table if not exists public.join_attempts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  attempted_at timestamp with time zone default now()
);

create table if not exists public.notification_preferences (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  due_date_reminders boolean default true,
  reminder_lead_days integer default 3,
  overdue_alerts boolean default true,
  warranty_expiry boolean default true,
  weekly_digest boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.notifications (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  task_id uuid,
  appliance_id uuid,
  type text not null,
  title text not null,
  body text not null,
  sent_at timestamp with time zone default now(),
  read_at timestamp with time zone,
  push_sent boolean default false
);

create table if not exists public.properties (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  nickname text not null,
  address text,
  city text,
  state text,
  country text,
  postal_code text,
  home_type text default 'house'::text,
  year_built integer,
  square_feet integer,
  bedrooms integer,
  bathrooms numeric(3,1),
  climate_zone text,
  purchase_date date,
  purchase_price numeric(12,2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  household_id uuid
);

create table if not exists public.push_subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamp with time zone default now(),
  last_used_at timestamp with time zone default now()
);

create table if not exists public.tasks (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  appliance text,
  due_date date not null,
  repeat text default 'once'::text,
  notes text,
  status text default 'due'::text,
  last_completed date,
  created_at timestamp with time zone default now(),
  appliance_id uuid,
  household_id uuid
);

create table if not exists public.waitlist (
  id uuid not null default gen_random_uuid(),
  email text not null,
  created_at timestamp with time zone default now()
);

-- Primary keys, unique and check constraints ----------------------

alter table only public.appliances add constraint appliances_category_check CHECK ((category = ANY (ARRAY['hvac'::text, 'plumbing'::text, 'electrical'::text, 'appliance'::text, 'other'::text])));
alter table only public.appliances add constraint appliances_pkey PRIMARY KEY (id);
alter table only public.household_members add constraint household_members_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'member'::text])));
alter table only public.household_members add constraint household_members_pkey PRIMARY KEY (household_id, user_id);
alter table only public.households add constraint households_pkey PRIMARY KEY (id);
alter table only public.households add constraint households_invite_code_key UNIQUE (invite_code);
alter table only public.join_attempts add constraint join_attempts_pkey PRIMARY KEY (id);
alter table only public.notification_preferences add constraint notification_preferences_pkey PRIMARY KEY (id);
alter table only public.notification_preferences add constraint notification_preferences_user_id_key UNIQUE (user_id);
alter table only public.notifications add constraint notifications_type_check CHECK ((type = ANY (ARRAY['due_soon'::text, 'overdue'::text, 'warranty_expiring'::text, 'warranty_expired'::text])));
alter table only public.notifications add constraint notifications_pkey PRIMARY KEY (id);
alter table only public.properties add constraint properties_home_type_check CHECK ((home_type = ANY (ARRAY['house'::text, 'apartment'::text, 'condo'::text, 'townhouse'::text, 'other'::text])));
alter table only public.properties add constraint properties_pkey PRIMARY KEY (id);
alter table only public.push_subscriptions add constraint push_subscriptions_pkey PRIMARY KEY (id);
alter table only public.push_subscriptions add constraint push_subscriptions_endpoint_key UNIQUE (endpoint);
alter table only public.tasks add constraint tasks_status_check CHECK ((status = ANY (ARRAY['due'::text, 'overdue'::text, 'done'::text])));
alter table only public.tasks add constraint tasks_pkey PRIMARY KEY (id);
alter table only public.waitlist add constraint waitlist_pkey PRIMARY KEY (id);
alter table only public.waitlist add constraint waitlist_email_key UNIQUE (email);

-- Foreign keys ----------------------------------------------------

alter table only public.appliances add constraint appliances_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
alter table only public.appliances add constraint appliances_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;
alter table only public.appliances add constraint appliances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.household_members add constraint household_members_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE;
alter table only public.household_members add constraint household_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.households add constraint households_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table only public.join_attempts add constraint join_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.notification_preferences add constraint notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.notifications add constraint notifications_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE CASCADE;
alter table only public.notifications add constraint notifications_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
alter table only public.notifications add constraint notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.properties add constraint properties_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
alter table only public.properties add constraint properties_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.push_subscriptions add constraint push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table only public.tasks add constraint tasks_appliance_id_fkey FOREIGN KEY (appliance_id) REFERENCES appliances(id) ON DELETE SET NULL;
alter table only public.tasks add constraint tasks_household_id_fkey FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
alter table only public.tasks add constraint tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Indexes --------------------------------------------------------

CREATE INDEX idx_appliances_household ON public.appliances USING btree (household_id);
CREATE INDEX idx_household_members_user ON public.household_members USING btree (user_id);
CREATE INDEX idx_join_attempts_user_time ON public.join_attempts USING btree (user_id, attempted_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);
CREATE INDEX idx_properties_household ON public.properties USING btree (household_id);
CREATE INDEX idx_push_subs_user ON public.push_subscriptions USING btree (user_id);
CREATE INDEX idx_tasks_household ON public.tasks USING btree (household_id);

-- Functions ------------------------------------------------------

-- Joining a household cannot be expressed as a policy: the caller is not a
-- member yet, so row level security would deny the insert. This function owns
-- that decision instead. It requires a signed in user, rate limits attempts,
-- and validates the invite code before adding the row.
CREATE OR REPLACE FUNCTION public.attempt_join_household(code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_attempts_count int;
  v_household record;
begin
  if v_user_id is null then
    return json_build_object('ok', false, 'error', 'Not signed in.');
  end if;

  select count(*) into v_attempts_count
  from join_attempts
  where user_id = v_user_id
  and attempted_at > now() - interval '1 hour';

  if v_attempts_count >= 5 then
    return json_build_object(
      'ok', false,
      'error', 'Too many attempts. Try again in an hour.'
    );
  end if;

  insert into join_attempts (user_id) values (v_user_id);

  select * into v_household
  from households
  where invite_code = upper(trim(code))
  and (invite_code_expires_at is null or invite_code_expires_at > now())
  limit 1;

  if v_household is null then
    return json_build_object('ok', false, 'error', 'Code not found or expired.');
  end if;

  begin
    insert into household_members (household_id, user_id, role)
    values (v_household.id, v_user_id, 'member');
  exception
    when unique_violation then
      null;
  end;

  return json_build_object(
    'ok', true,
    'household', row_to_json(v_household)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_my_household_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select household_id from household_members where user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.regenerate_invite_code(hid uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_new_code text := 'H-';
  v_chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_i int;
  v_household record;
begin
  if v_user_id is null then
    return json_build_object('ok', false, 'error', 'Not signed in.');
  end if;

  select * into v_household from households where id = hid;

  if v_household is null then
    return json_build_object('ok', false, 'error', 'Household not found.');
  end if;

  if v_household.created_by <> v_user_id then
    return json_build_object('ok', false, 'error', 'Only the owner can regenerate.');
  end if;

  for v_i in 1..8 loop
    v_new_code := v_new_code || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
  end loop;

  update households
  set invite_code = v_new_code,
      invite_code_expires_at = now() + interval '30 days'
  where id = hid;

  return json_build_object('ok', true, 'invite_code', v_new_code);
end;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;


-- Triggers --------------------------------------------------------

-- Installed by Supabase: an event trigger that turns row level security on
-- for every new table in the public schema. There are no row triggers.
-- A fresh project already has a trigger with this name, so it is dropped first.
drop event trigger if exists ensure_rls;
create event trigger ensure_rls on ddl_command_end execute function public.rls_auto_enable;

-- Row level security ----------------------------------------------

alter table public.appliances enable row level security;
alter table public.household_members enable row level security;
alter table public.households enable row level security;
alter table public.join_attempts enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.properties enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.tasks enable row level security;
alter table public.waitlist enable row level security;

-- Policies --------------------------------------------------------

create policy "Delete appliances own" on public.appliances as permissive for delete to public using ((auth.uid() = user_id));
create policy "Insert appliances own" on public.appliances as permissive for insert to public with check ((auth.uid() = user_id));
create policy "Read appliances own or household" on public.appliances as permissive for select to public using (((auth.uid() = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
create policy "Update appliances own or household" on public.appliances as permissive for update to public using (((auth.uid() = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));

create policy "Members view each other" on public.household_members as permissive for select to public using (((household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids)) OR (user_id = auth.uid())));
create policy "Owners insert themselves on household creation" on public.household_members as permissive for insert to public with check (((user_id = auth.uid()) AND (household_id IN ( SELECT households.id
   FROM households
  WHERE (households.created_by = auth.uid())))));
create policy "Users leave or owners remove" on public.household_members as permissive for delete to public using (((user_id = auth.uid()) OR (household_id IN ( SELECT households.id
   FROM households
  WHERE (households.created_by = auth.uid())))));

create policy "Authenticated users create households" on public.households as permissive for insert to public with check ((auth.uid() = created_by));
create policy "Members view their household" on public.households as permissive for select to public using (((id IN ( SELECT get_my_household_ids() AS get_my_household_ids)) OR (created_by = auth.uid())));
create policy "Owners update their household" on public.households as permissive for update to public using ((created_by = auth.uid()));

create policy "Users read own attempts" on public.join_attempts as permissive for select to public using ((auth.uid() = user_id));

create policy "Users insert own prefs" on public.notification_preferences as permissive for insert to public with check ((auth.uid() = user_id));
create policy "Users read own prefs" on public.notification_preferences as permissive for select to public using ((auth.uid() = user_id));
create policy "Users update own prefs" on public.notification_preferences as permissive for update to public using ((auth.uid() = user_id));

create policy "Users read own notifications" on public.notifications as permissive for select to public using ((auth.uid() = user_id));
create policy "Users update own notifications" on public.notifications as permissive for update to public using ((auth.uid() = user_id));

create policy "Delete properties own" on public.properties as permissive for delete to public using ((auth.uid() = user_id));
create policy "Insert properties own" on public.properties as permissive for insert to public with check ((auth.uid() = user_id));
create policy "Read properties own or household" on public.properties as permissive for select to public using (((auth.uid() = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
create policy "Update properties own or household" on public.properties as permissive for update to public using (((auth.uid() = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));

create policy "Users delete own subs" on public.push_subscriptions as permissive for delete to public using ((auth.uid() = user_id));
create policy "Users insert own subs" on public.push_subscriptions as permissive for insert to public with check ((auth.uid() = user_id));
create policy "Users read own subs" on public.push_subscriptions as permissive for select to public using ((auth.uid() = user_id));

create policy "Delete tasks own" on public.tasks as permissive for delete to public using ((auth.uid() = user_id));
create policy "Insert tasks own" on public.tasks as permissive for insert to public with check ((auth.uid() = user_id));
create policy "Read tasks own or household" on public.tasks as permissive for select to public using (((auth.uid() = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
create policy "Update tasks own or household" on public.tasks as permissive for update to public using (((auth.uid() = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));

create policy "Public can join waitlist" on public.waitlist as permissive for insert to public with check (true);

-- The waitlist is the one table anyone may write to without an account, and
-- nobody can read it back through the API (there is no select policy).

-- Grants ----------------------------------------------------------

-- These are the Supabase defaults. The anon key ships in the browser bundle
-- and is public by design, so it is granted everything at the table level.
-- Row level security above is the actual boundary, not the grants.
grant all on all routines in schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
