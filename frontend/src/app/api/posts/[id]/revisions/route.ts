import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const revisions = await prisma.postRevision.findMany({
    where: { postId: parseInt(params.id) },
    orderBy: { revisionNumber: 'desc' },
  });
  return NextResponse.json({ success: true, message: 'Revisions fetched', data: revisions });
}
