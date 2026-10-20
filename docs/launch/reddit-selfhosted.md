Title: Hearth – self-hostable home maintenance tracker (open source, MIT)

Body:

Looking for a way to track appliances, warranties, and recurring maintenance so things don't slip through the cracks? I built Hearth, a simple web app for this.

- Open source (MIT): https://github.com/alonemanguy/hearth-app
- Live demo: https://gethearth.vercel.app
- Self-host in one click: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/alonemanguy/hearth-app) or `docker compose up --build`
- Needs Supabase for auth + DB (all policies in migrations). Client only uses the public anon key; RLS protects everything.

Features:
- Appliances with make/model/serial, purchase/install, warranty, lifespan
- Recurring tasks, due dates, completion history
- In-app + optional web push reminders
- Shared homes with invite codes
- Warranties expiring soon
- Export JSON / delete account
- PWA, mobile-friendly

It's an early beta (works end to end, no automated tests yet). Push and analytics are optional. Self-host docs and migrations are included. Any feedback is welcome, especially from people who self-host it.
