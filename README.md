# Hearth

A home maintenance tracker. Keep every appliance, warranty, and service date in
one place, and get reminded before something is due.

The app runs at <https://gethearth.vercel.app>.

## What it does

- **Appliances.** Name, make, model, serial number, install and purchase dates,
  warranty expiry, and expected lifespan, grouped by home.
- **Maintenance tasks.** Repeating schedules attached to an appliance or the
  home, each with a due date, notes, and a completion history.
- **Reminders.** In-app notifications plus optional web push, with per-type
  preferences and a configurable lead time.
- **Warranties.** Everything that expires soon, in one list.
- **Home health.** A score built from overdue work, task coverage, and average
  appliance age.
- **Shared homes.** Invite another person with a code so you both see the same
  appliances and tasks.
- **Your data.** Export everything as JSON, or delete the account and its rows
  from the database.

## Stack

- React 19 and TypeScript, built with Vite
- React Router
- Supabase for Postgres, authentication, and Row Level Security
- PostHog for opt-in product analytics
- A service worker for web push
- Deployed on Vercel

## Run it locally

Requires Node 22 or newer and pnpm 10.

```
pnpm install
cp .env.example .env.local
pnpm dev
```

The dev server listens on port 8443 by default. `pnpm build` produces a static
bundle in `dist/`.

## Configuration

All configuration is build time and client side, so every value below ships in
the bundle. The Supabase anon key is a public credential; Row Level Security is
what protects each row.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | no | Your Supabase project URL. Falls back to the demo instance. |
| `VITE_SUPABASE_ANON_KEY` | no | Your project's anon key. Falls back to the demo instance. |
| `VITE_VAPID_PUBLIC_KEY` | no | Public half of a VAPID key pair, for web push. |
| `VITE_POSTHOG_KEY` | no | PostHog project key. Analytics stay off when blank. |
| `VITE_POSTHOG_HOST` | no | PostHog host, `https://us.i.posthog.com` by default. |

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` the app points at the
public demo instance. Set both to run against your own project.

## Self-hosting

Hearth needs a Supabase project for storage and authentication.

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migrations in `supabase/migrations/` in filename order. They create
   every table, key, index, function, and policy the client expects.
3. Keep Row Level Security on for every table. The migrations turn it on and
   carry the policies, which are the source of truth for who can read what. If
   you add a table, add policies that scope rows to `auth.uid()`; a table with
   RLS on and no policy is readable by nobody, which is the safe default.
4. Enable email and password auth, and decide whether new accounts must confirm
   their email before signing in.
5. For push notifications, generate a VAPID key pair and deploy a Supabase edge
   function that sends them. The private key stays in that function.
6. Deploy to Vercel and add the variables above in the project settings.

## Security

- No secrets are stored in this repository. There is no service role key
  anywhere in the client, and there never should be one.
- The Supabase anon key is not a secret. It is visible in every deployed
  bundle. Data protection comes from Row Level Security in the database.
- The schema and the policies are in `supabase/migrations/` so they can be read
  and audited rather than taken on trust. They contain no credentials.
- Security headers and a Content Security Policy are set in `vercel.json`.
- To report a vulnerability, see [SECURITY.md](SECURITY.md).

## A note on the build tooling

The project was scaffolded inside Figma Make, so `vite.config.ts` wires up the
plugins under `.figma/make/` and `AGENTS.md` describes that workflow. They are
part of the build, not the app, and the app itself is plain React and Vite.

## License

MIT. See [LICENSE](LICENSE).
