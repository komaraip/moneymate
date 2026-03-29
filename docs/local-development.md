# Local Development

## Database Options

MoneyMate works with any PostgreSQL database. The most stable local setup is a normal Postgres instance pointed to by `DATABASE_URL` in `.env`.

If you want to use Prisma local Postgres on Windows instead:

1. Install Node.js 20 or newer.
2. Run `npm run db:local:start`.
3. Run `npm run prisma:push`.
4. Start the app with `npm run dev`.

The helper script reads Prisma's cached local DB metadata, removes stale `.pglite` lock files when it is safe, and syncs the generated `prisma+postgres://...` URL back into `.env`.

## Recovery

If Prisma local Postgres stops starting and you see `Start Local Database failed: Aborted()`:

1. Check the cached instance state with `npm run db:local:status`.
2. Re-sync the saved ports into `.env` with `npm run db:local:sync-env`.
3. If the instance is still broken, recreate it with `npm run db:local:reset`.
4. Re-apply the schema with `npm run prisma:push`.

## Notes

- Prisma local Postgres is a preview feature and may be less stable than a regular Postgres server.
- Prisma's current local Postgres flow requires Node.js 20+.
- Prisma local Postgres currently accepts one connection at a time, so avoid running the Next app and the worker against it simultaneously when you're debugging startup or migration issues.
- If the app was already running when `.env` changed, restart `npm run dev`.
