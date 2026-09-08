import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Notification } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 100);
  const { count, rows } = await Notification.findAndCountAll({
    where: { userId }, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']],
  });
  const unreadCount = await Notification.count({ where: { userId, readAt: null } });
  return NextResponse.json({
    success: true, message: 'Notifications fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit), unreadCount },
  });
}
