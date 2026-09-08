import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Notification } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  await Notification.update({ readAt: new Date() }, { where: { userId, readAt: null } });
  return NextResponse.json({ success: true, message: 'All notifications marked read' });
}
