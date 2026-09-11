import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { attachRoles } from '@/database/shapes';
import bcrypt from 'bcrypt';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    const filtered = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);
    const data = await Promise.all(paged.map(attachRoles));
    return NextResponse.json({
      success: true, message: 'Users fetched',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  const total = await prisma.user.count({ where });
  const rows = await prisma.user.findMany({
    where, take: limit, skip: (page - 1) * limit,
    orderBy: { createdAt: 'desc' },
  });
  const data = await Promise.all(rows.map(attachRoles));

  return NextResponse.json({
    success: true, message: 'Users fetched',
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name, email, password, roleIds } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, avatar: null, bio: null, status: 'active' },
    });

    let assignedRoleIds = roleIds;
    if (!assignedRoleIds || !assignedRoleIds.length) {
      const userRole = await prisma.role.findFirst({ where: { slug: 'user' } });
      assignedRoleIds = userRole ? [userRole.id] : [];
    }
    if (assignedRoleIds.length) {
      await prisma.userRole.createMany({
        data: assignedRoleIds.map((rid: number) => ({ userId: user.id, roleId: rid })),
      });
    }

    const full = await prisma.user.findUnique({ where: { id: user.id } });
    const data = await attachRoles(full!);
    return NextResponse.json({ success: true, message: 'User created', data }, { status: 201 });
  } catch (err: any) {
    if (err?.status) return NextResponse.json({ success: false, message: err.message }, { status: err.status });
    return NextResponse.json({ success: false, message: 'Failed to create user' }, { status: 500 });
  }
}
