import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { attachPermissions } from '@/database/shapes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const role = await prisma.role.findUnique({ where: { id: parseInt(params.id) } });
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  const data = await attachPermissions(role);
  return NextResponse.json({ success: true, message: 'Role fetched', data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const role = await prisma.role.findUnique({ where: { id: parseInt(params.id) } });
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  if (role.isSystem) {
    return NextResponse.json({ success: false, message: 'System roles cannot be updated' }, { status: 403 });
  }
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  const updated = await prisma.role.update({ where: { id: role.id }, data });
  return NextResponse.json({ success: true, message: 'Role updated', data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const role = await prisma.role.findUnique({ where: { id: parseInt(params.id) } });
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  if (role.isSystem) {
    return NextResponse.json({ success: false, message: 'System roles cannot be deleted' }, { status: 403 });
  }
  await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
  await prisma.role.delete({ where: { id: role.id } });
  return NextResponse.json({ success: true, message: 'Role deleted' });
}
