import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Role, Permission, RolePermission } from '@/database/seeders';
import { slugify } from '@/lib/utils/slug';

export const runtime = 'nodejs';

const include = [{ model: Permission, as: 'permissions' }];

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);
  const { count, rows } = await Role.findAndCountAll({ include, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });
  return NextResponse.json({
    success: true, message: 'Roles fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name, slug, description } = body;
  if (!name || !slug) {
    return NextResponse.json({ success: false, message: 'Name and slug are required' }, { status: 400 });
  }
  const existing = await Role.findOne({ where: { slug } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Role slug already exists' }, { status: 409 });
  }
  const role = await Role.create({ name, slug, description: description || null, isSystem: false });
  return NextResponse.json({ success: true, message: 'Role created', data: role }, { status: 201 });
}
