# Finsight Finance Manager

A personal finance dashboard built with Next.js, Prisma, Supabase Postgres, Supabase Auth, and private Supabase Storage backups.

## Supabase setup

The app uses the Supabase project database for `Profile`, `Transaction`, `Budget`, and `Backup` records. It uses Supabase Auth for email/password accounts and a private Storage bucket for backup JSON files.

1. In Supabase, open **Project Settings → API** and copy the **Project URL**, **anon public key**, and **service_role key**.
2. Run [`supabase/setup.sql`](./supabase/setup.sql) in the Supabase SQL Editor to create the private `finsight-backups` bucket.
3. Add these variables to Vercel (Preview and Production):

```env
DATABASE_URL=your-supabase-postgres-connection-string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BACKUP_BUCKET=finsight-backups
```

The service-role key must stay server-only. Never prefix it with `NEXT_PUBLIC_`, commit it, or place it in client code.

## Local development

```bash
pnpm install
pnpm db:push
pnpm dev
```

The dashboard opens at `http://localhost:3000`. Without public Supabase keys, the dashboard still renders preview data; once the public URL and anon key are present, the **Sign in** control enables Supabase email/password auth. Signed-in users can create a private backup from the **Backup** control. Backups contain that user’s transactions and budgets and are stored under `user-id/filename.json` in the private bucket. Backup metadata is stored in the `Backup` table.

## Deploy to Vercel

1. Import `Shubh072/finsight-finance-manager` into Vercel.
2. Add all five environment variables above.
3. Deploy. The included build command runs `prisma generate && next build`.
4. If the database schema has not been applied, run `pnpm db:push` once using the Supabase connection string.
5. In Supabase Auth, set the production **Site URL** and redirect URLs to your Vercel domain.

## Security note

The database password was supplied in the setup request and is used only in the ignored local `.env` file. Because credentials shared in chat should be treated as exposed, rotate the Supabase database password after setup, then update `DATABASE_URL` in Vercel and locally.
