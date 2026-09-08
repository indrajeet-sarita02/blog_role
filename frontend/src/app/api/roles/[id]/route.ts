import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Role, Permission, RolePermission } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const role = await Role.findByPk(parseInt(params.id), { include: [{ model: Permission, as: 'permissions' }] });
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Role fetched', data: role });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const role = await Role.findByPk(parseInt(params.id));
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  if (role.isSystem) {
    return NextResponse.json({ success: false, message: 'System roles cannot be updated' }, { status: 403 });
  }
  if (body.name !== undefined) role.name = body.name;
  if (body.description !== undefined) role.description = body.description;
  await role.save();
  return NextResponse.json({ success: true, message: 'Role updated', data: role });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const role = await Role.findByPk(parseInt(params.id));
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  if (role.isSystem) {
    return NextResponse.json({ success: false, message: 'System roles cannot be deleted' }, { status: 403 });
  }
  await RolePermission.destroy({ where: { roleId: role.id } });
  await role.destroy();
  return NextResponse.json({ success: true, message: 'Role deleted' });
}
