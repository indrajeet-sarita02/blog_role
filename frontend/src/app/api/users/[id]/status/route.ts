import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User } from '@/database/seeders';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const user = await User.findByPk(parseInt(params.id));
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  if (body.status) user.status = body.status;
  await user.save();
  return NextResponse.json({ success: true, message: 'User status updated', data: user });
}
