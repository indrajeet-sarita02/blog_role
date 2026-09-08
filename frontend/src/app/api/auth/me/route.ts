import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User, Role } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  const user = await User.findOne({
    where: { id: userId },
    include: [{ model: Role, as: 'roles' }],
  });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Authenticated', data: user });
}
