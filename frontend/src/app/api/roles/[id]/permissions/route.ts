import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Role, Permission, RolePermission } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const roleId = parseInt(params.id);
  const role = await Role.findByPk(roleId);
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  const links = await RolePermission.findAll({ where: { roleId } });
  const permIds = links.map((l) => l.permissionId);
  const perms = await Permission.findAll({ where: { id: permIds }, order: [['module', 'ASC'], ['id', 'ASC']] });
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
  const role = await Role.findByPk(roleId);
  if (!role) {
    return NextResponse.json({ success: false, message: 'Role not found' }, { status: 404 });
  }
  await RolePermission.destroy({ where: { roleId } });
  if (permissionIds.length) {
    await RolePermission.bulkCreate(permissionIds.map((pid: number) => ({ roleId, permissionId: pid })));
  }
  const permIds = permissionIds;
  const perms = await Permission.findAll({ where: { id: permIds }, order: [['module', 'ASC'], ['id', 'ASC']] });
  return NextResponse.json({ success: true, message: 'Role permissions updated', data: perms });
}
