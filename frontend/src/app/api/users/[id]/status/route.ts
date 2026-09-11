import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { id: parseInt(params.id) } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ success: true, message: 'User status updated', data: updated });
}
