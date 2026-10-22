# Show HN: Hearth – open-source home maintenance tracker with reminders

I've been building Hearth, an open-source home maintenance tracker that helps you keep appliances, warranties, and service dates in one place with in-app and web-push reminders. 

It's an early public beta: works end to end (auth, households, tasks, warranties, home health), but still no automated tests yet (CI runs typecheck+build only).

## What it does
- Track appliances (model/serial, purchase/install, warranty, expected lifespan)
- Recurring maintenance tasks tied to appliances or the whole home
- Reminders (in-app + optional web push, per-type preferences and lead time)
- Warranties expiring soon, shared homes (invite codes), export as JSON, account deletion
- PWA installable, caches shell; writes need connection

## Stack
React 19 + TypeScript + Vite, Supabase (Postgres, Auth, RLS), PostHog (opt-in), Vercel-hosted.

## Try it
Demo: https://gethearth.vercel.app  
Source: https://github.com/alonemanguy/hearth-app  

## Self-hosting
One-click on Vercel: https://vercel.com/new/clone?repository-url=https://github.com/alonemanguy/hearth-app  
Or docker compose: clone, copy .env.example, fill `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, run `docker compose up --build`.

## Notes
- Only the Supabase anon key is used client-side; RLS is the enforcement boundary (migrations enforce it).
- Push notifications are optional (in-app works without them).
- No import yet, no offline editing (known rough edges in README).

The biggest design choice: keep it simple and self-hostable from day one. Migrations are in supabase/migrations/ and have been verified against production structure, but they haven't been replayed on a brand-new Supabase project by others yet — I'd be grateful if someone with a fresh project could try them and open an issue if anything surfaces.

Feedback welcome here or on GitHub. Thanks for looking!