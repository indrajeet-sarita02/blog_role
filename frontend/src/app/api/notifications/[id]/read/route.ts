import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Notification } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const notif = await Notification.findOne({ where: { id: parseInt(params.id), userId } });
  if (!notif) {
    return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
  }
  notif.readAt = new Date();
  await notif.save();
  return NextResponse.json({ success: true, message: 'Notification marked read' });
}
