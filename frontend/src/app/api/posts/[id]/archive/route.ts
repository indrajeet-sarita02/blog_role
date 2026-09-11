import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const post = await prisma.post.findUnique({ where: { id: parseInt(params.id), deletedAt: null } });
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
  }
  const updated = await prisma.post.update({ where: { id: post.id }, data: { status: 'archived' } });
  return NextResponse.json({ success: true, message: 'Post archived', data: updated });
}
