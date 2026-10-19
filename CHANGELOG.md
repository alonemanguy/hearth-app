# Changelog

Notable changes to Hearth. The file starts at the first tagged release, so 0.1.0
describes the app as it stands rather than replaying the commits behind it.

## [0.1.0] - 2026-10-19

First public release.

### Added

- Appliances with make, model, serial number, install and purchase dates,
  warranty expiry, and expected lifespan, grouped by home.
- Maintenance tasks with repeat schedules, due dates, notes, and completion
  history.
- Reminders: in-app notifications and optional web push, with per-type
  preferences and a configurable lead time.
- A single list of everything whose warranty expires soon.
- A home health score built from overdue work, task coverage, and appliance age.
- Shared households, joined with an invite code.
- JSON export of everything, and account deletion.
- Email and password accounts with email confirmation and password reset.
- An installable PWA with a cached app shell.
- Opt-in PostHog analytics behind a consent gate.

### Security

- Row Level Security on every table, with the schema and policies committed to
  the repository so they can be reviewed.
- The two `SECURITY DEFINER` functions check the caller themselves and are not
  executable by `anon`.
- The waitlist validates addresses and caps signups per client.
- A Content Security Policy and other security headers in `vercel.json`.

[0.1.0]: https://github.com/alonemanguy/hearth-app/releases/tag/v0.1.0
