import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User, Role, UserRole } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const include = [{ model: Role, as: 'roles' }];

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const user = await User.findOne({ where: { id: parseInt(params.id) }, include });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'User fetched', data: user });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const user = await User.findByPk(parseInt(params.id));
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  if (body.name !== undefined) user.name = body.name;
  if (body.avatar !== undefined) user.avatar = body.avatar;
  if (body.bio !== undefined) user.bio = body.bio;
  await user.save();
  const full = await User.findOne({ where: { id: user.id }, include });
  return NextResponse.json({ success: true, message: 'User updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const user = await User.findByPk(parseInt(params.id));
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  await UserRole.destroy({ where: { userId: user.id } });
  await user.destroy();
  return NextResponse.json({ success: true, message: 'User deleted' });
}
