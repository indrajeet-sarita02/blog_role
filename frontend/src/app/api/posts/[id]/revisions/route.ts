import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, PostRevision } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const revisions = await PostRevision.findAll({
    where: { postId: parseInt(params.id) },
    order: [['revisionNumber', 'DESC']],
  });
  return NextResponse.json({ success: true, message: 'Revisions fetched', data: revisions });
}
