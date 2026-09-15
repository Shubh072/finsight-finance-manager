-- Run this in Supabase SQL Editor once.
-- The server uses SUPABASE_SERVICE_ROLE_KEY for uploads, so the bucket remains private.
insert into storage.buckets (id, name, public)
values ('finsight-backups', 'finsight-backups', false)
on conflict (id) do update set public = false;

-- Optional: enable RLS on application tables if you later move reads/writes from
-- Prisma's server connection to Supabase's browser client. Prisma's server
-- connection currently uses the database role and scopes rows by userId.

-- Never store Supabase service-role keys in browser code or NEXT_PUBLIC_* variables.
