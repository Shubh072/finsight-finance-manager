# Finsight Finance Manager

A focused personal finance dashboard built with Next.js, Prisma, and PostgreSQL. The interface runs with preview data out of the box, then automatically reads from Postgres when `DATABASE_URL` is configured.

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open `http://localhost:3000`.

## Connect a database

Create a hosted PostgreSQL database with **Vercel Postgres**, **Neon**, **Supabase**, or **Railway**. Copy its pooled connection string into `DATABASE_URL`:

```env
DATABASE_URL="postgresql://user:password@host:5432/finsight?sslmode=require"
```

Push the Prisma schema to the database:

```bash
pnpm db:push
```

The current schema stores `Transaction` and `Budget` records. The dashboard endpoint at `/api/dashboard` reads both tables and calculates budget usage by category.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **New Project** and import `Shubh072/finsight-finance-manager`.
3. Keep the framework preset as **Next.js**. The included `vercel.json` uses `prisma generate && next build` automatically.
4. Add `DATABASE_URL` under **Settings → Environment Variables** for Preview and Production.
5. Deploy. If the database is new, run `pnpm db:push` once against its connection string before opening the deployed site.

You can also deploy from the CLI:

```bash
pnpm dlx vercel
pnpm dlx vercel env add DATABASE_URL production
pnpm dlx vercel --prod
```

## Data model

- `Transaction`: merchant, category, amount, type (`expense` or `income`), date, and note.
- `Budget`: category, monthly amount, display color, and calculated spend.

For production, use a pooled `DATABASE_URL` at runtime and keep a direct/unpooled connection string for Prisma CLI migrations if your provider supplies both.
