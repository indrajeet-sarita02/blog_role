import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { attachRoles } from '@/database/shapes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const user = await prisma.user.findUnique({ where: { id: parseInt(params.id) } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  const data = await attachRoles(user);
  return NextResponse.json({ success: true, message: 'User fetched', data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const user = await prisma.user.findUnique({ where: { id: parseInt(params.id) } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.avatar !== undefined) data.avatar = body.avatar;
  if (body.bio !== undefined) data.bio = body.bio;
  await prisma.user.update({ where: { id: user.id }, data });
  const updated = await prisma.user.findUnique({ where: { id: user.id } });
  const full = await attachRoles(updated!);
  return NextResponse.json({ success: true, message: 'User updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const user = await prisma.user.findUnique({ where: { id: parseInt(params.id) } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  await prisma.userRole.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  return NextResponse.json({ success: true, message: 'User deleted' });
}
