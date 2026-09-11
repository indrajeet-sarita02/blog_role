import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const userId = getUserIdFromRequest(_req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const notif = await prisma.notification.findFirst({
    where: { id: parseInt(params.id), userId },
  });
  if (!notif) {
    return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
  }
  await prisma.notification.delete({
    where: { id: notif.id },
  });
  return NextResponse.json({ success: true, message: 'Notification deleted' });
}
