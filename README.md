# Hearth

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://gethearth.vercel.app)

A home maintenance tracker. Keep every appliance, warranty, and service date in
one place, and get reminded before something is due.

Early public beta · [Hosted demo](https://gethearth.vercel.app) · [Self-hosting](#self-hosting)

<p align="center">
  <img src="docs/screenshots/home.png" width="330" alt="The home screen: this month's tasks and the home health score">
  <img src="docs/screenshots/add-appliance.png" width="330" alt="Adding an appliance, starting from a list of common appliances">
</p>

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

## Status

Hearth is an early public beta: it works end to end and it is used, but it is
still being sanded down in the open.

**Works today**

- Email and password accounts, including confirmation and password reset.
- The whole appliance and task loop above, with shared households, invite codes,
  the warranty list, and the home health score.
- Web push on top of in-app notifications, with per-type preferences and a
  configurable lead time.
- Export everything as JSON, or delete the account and its rows.
- Installs as a PWA and runs from a cached shell.

**Rough edges**

- No automated tests yet. Continuous integration runs a type check and a build,
  and nothing more.
- Push notifications need your own VAPID key pair and an edge function you deploy
  yourself. Everything else works without them.
- One maintainer, so issues and pull requests are answered in spare time.

**Not built yet**

- No import, only export.
- No offline editing. The service worker caches the shell; writes need a
  connection.
- No reminder channels beyond in-app and web push, so no email or SMS digests.

There is also a waitlist screen in the app. It is switched off (`WAITLIST_MODE`),
so signups are simply open.

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
   every table, key, index, function, and policy the client expects. Nothing else
   in the database is needed.
3. **Leave Row Level Security on for every table.** The migrations turn it on and
   carry the policies, which are the source of truth for who can read what. With
   it off, anyone holding the anon key, which is public by design, can read every
   table. If you add a table, add policies that scope rows to `auth.uid()`; a
   table with RLS on and no policy is readable by nobody, which is the safe
   default.
4. Enable email and password auth, and decide whether new accounts must confirm
   their email before signing in.
5. Copy `.env.example` to `.env.local`, set `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` from your project, and check that `pnpm dev` signs a
   user up.
6. Deploy to Vercel and add the same variables in the project settings.
7. For push notifications, generate a VAPID key pair and deploy a Supabase edge
   function that sends them. The private key stays in that function.

Only steps 1 to 4 and 6 are needed for the app to work. PostHog stays off until
you set `VITE_POSTHOG_KEY`. Push is optional: without step 7, reminders still
arrive in the in-app notification list.

## Security

- No secrets are stored in this repository. There is no service role key
  anywhere in the client, and there never should be one.
- The Supabase anon key is not a secret. It is meant to ship to browsers and it
  is present in every deployed bundle. Row Level Security is what protects each
  row, and it is documented in [SECURITY.md](SECURITY.md).
- The schema and its policies are in `supabase/migrations/`, so they can be
  reviewed and tested instead of taken on trust. Nothing in them is a credential.
- The one table anybody can write to without an account is the waitlist, and it
  is guarded: addresses are validated and capped per client.
- Report a vulnerability through the private advisory button described in
  [SECURITY.md](SECURITY.md) rather than a public issue.

## Contributing

Issues are welcome, and reports from people running Hearth against their own
Supabase project are especially useful. Say what you did and what happened; a
short reproduction helps.

Pull requests are accepted but slow while the app stabilises, so open an issue
first and agree the shape of the change before writing it. There is no test suite
yet, so a pull request that touches the database or the auth flow should say how
it was checked.

Security problems do not belong in a public issue. See
[SECURITY.md](SECURITY.md).

## On the Figma Make scaffolding

The project was scaffolded inside Figma Make, so `vite.config.ts` wires up the
plugins under `.figma/make/` and `AGENTS.md` describes that workflow. They are
tools for building the app, not part of it; the app itself is plain React and
Vite.

## License

MIT. See [LICENSE](LICENSE).
