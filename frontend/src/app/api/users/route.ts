import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User, Role, UserRole, sequelize } from '@/database/seeders';
import bcrypt from 'bcrypt';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

const include = [{ model: Role, as: 'roles' }];

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const status = params.get('status');
  const search = params.get('search');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    const s = search.toLowerCase();
    // Filter in memory for simplicity
    const users = await User.findAll({ include });
    const filtered = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    const total = filtered.length;
    const start = (page - 1) * limit;
    return NextResponse.json({
      success: true, message: 'Users fetched',
      data: filtered.slice(start, start + limit),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const { count, rows } = await User.findAndCountAll({ where, include, limit, offset: (page - 1) * limit, order: [['createdAt', 'DESC']] });

  return NextResponse.json({
    success: true, message: 'Users fetched',
    data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name, email, password, roleIds } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
  }

  return sequelize.transaction(async (t) => {
    const existing = await User.findOne({ where: { email } }, { transaction: t });
    if (existing) {
      throw { status: 409, message: 'Email already in use' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, avatar: null, bio: null, status: 'active' }, { transaction: t });

    let assignedRoleIds = roleIds;
    if (!assignedRoleIds || !assignedRoleIds.length) {
      const userRole = await Role.findOne({ where: { slug: 'user' } }, { transaction: t });
      assignedRoleIds = userRole ? [userRole.id] : [];
    }
    if (assignedRoleIds.length) {
      await UserRole.bulkCreate(assignedRoleIds.map((rid: number) => ({ userId: user.id, roleId: rid })), { transaction: t });
    }

    return user;
  }).then((user) =>
    User.findOne({ where: { id: user.id }, include }).then((full) =>
      NextResponse.json({ success: true, message: 'User created', data: full }, { status: 201 }),
    ),
  ).catch((err) => {
    if (err?.status) return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    return NextResponse.json({ success: false, message: 'Failed to create user' }, { status: 500 });
  });
}
