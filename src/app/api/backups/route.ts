import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase Storage is not configured.' }, { status: 503 });
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in before creating a backup.' }, { status: 401 });

  const [transactions, budgets] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: user.id }, orderBy: { occurredAt: 'desc' } }),
    prisma.budget.findMany({ where: { userId: user.id }, orderBy: { category: 'asc' } }),
  ]);
  await prisma.profile.upsert({ where: { id: user.id }, update: { email: user.email }, create: { id: user.id, email: user.email } });
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), userId: user.id, transactions, budgets });
  const fileName = `finsight-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const storagePath = `${user.id}/${fileName}`;
  const admin = createSupabaseAdminClient();
  const bucket = process.env.SUPABASE_BACKUP_BUCKET || 'finsight-backups';
  const { error: uploadError } = await admin.storage.from(bucket).upload(storagePath, Buffer.from(payload), { contentType: 'application/json', upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 502 });
  const backup = await prisma.backup.create({ data: { userId: user.id, storagePath, fileName, sizeBytes: Buffer.byteLength(payload), contentType: 'application/json' } });
  return NextResponse.json({ backup: { id: backup.id, fileName: backup.fileName, sizeBytes: backup.sizeBytes, createdAt: backup.createdAt } });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to view backups.' }, { status: 401 });
  const backups = await prisma.backup.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, fileName: true, sizeBytes: true, createdAt: true } });
  return NextResponse.json({ backups });
}
