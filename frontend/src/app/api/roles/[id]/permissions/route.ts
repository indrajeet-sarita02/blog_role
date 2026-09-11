import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const roleId = parseInt(params.id);
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  const links = await prisma.rolePermission.findMany({ where: { roleId } });
  const permIds = links.map((l) => l.permissionId);
  const perms = await prisma.permission.findMany({
    where: { id: { in: permIds } },
    orderBy: [{ module: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json({ success: true, message: 'Role permissions fetched', data: perms });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const roleId = parseInt(params.id);
  const { permissionIds } = body;
  if (!Array.isArray(permissionIds)) {
    return NextResponse.json({ success: false, message: 'permissionIds is required' }, { status: 400 });
  }
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  await prisma.rolePermission.deleteMany({ where: { roleId } });
  if (permissionIds.length) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((pid: number) => ({ roleId, permissionId: pid })),
    });
  }
  const perms = await prisma.permission.findMany({
    where: { id: { in: permissionIds } },
    orderBy: [{ module: 'asc' }, { id: 'asc' }],
  });
  return NextResponse.json({ success: true, message: 'Role permissions updated', data: perms });
}
