import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { attachRoles } from '@/database/shapes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const userId = parseInt(params.id);
  const { roleIds } = body;
  if (!Array.isArray(roleIds)) {
    return NextResponse.json({ success: false, message: 'roleIds is required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  await prisma.userRole.deleteMany({ where: { userId } });
  if (roleIds.length) {
    await prisma.userRole.createMany({
      data: roleIds.map((rid: number) => ({ userId, roleId: rid })),
    });
  }
  const full = await prisma.user.findUnique({ where: { id: userId } });
  const data = await attachRoles(full!);
  return NextResponse.json({ success: true, message: 'User roles updated', data });
}
