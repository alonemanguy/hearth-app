# Database

The database schema lives here, so a fresh Supabase project can be built from
the same source the app runs against.

## Migrations

Apply them in filename order.

| File | What it does |
| --- | --- |
| `20261019120000_init.sql` | The whole schema: extensions, 10 tables, keys, indexes, 4 functions, an event trigger, RLS on every table, and all policies. |
| `20261019130000_harden_rls_and_grants.sql` | Wraps `auth.uid()` in the policy expressions so it is evaluated once per query, adds the indexes the foreign keys were missing, and removes the `anon` grant from the two functions that only signed in screens call. |

`20261019120000_init.sql` was generated from the running project's catalogs
(`pg_catalog` and `information_schema`) rather than typed by hand, so it matches
production object for object. It has not been replayed against a brand new
project yet: if you self-host, read it once before you apply it, and compare it
with `src/lib/types.ts` and `src/lib/household.ts`.

## Applying

From the dashboard, paste the file into the SQL editor and run it. With the
Supabase CLI, with the project linked:

```
supabase db push
```

## What is not in here

- No keys, connection strings, or passwords. Those live in your own
  environment; see `.env.example`.
- No data. These are schema files only.
- No storage buckets or edge functions.

