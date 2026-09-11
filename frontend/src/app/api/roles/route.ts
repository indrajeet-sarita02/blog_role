import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { attachPermissions } from '@/database/shapes';
import { slugify } from '@/lib/utils/slug';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);
  const total = await prisma.role.count();
  const rows = await prisma.role.findMany({
    take: limit, skip: (page - 1) * limit,
    orderBy: { createdAt: 'desc' },
  });
  const data = await Promise.all(rows.map(attachPermissions));
  return NextResponse.json({
    success: true, message: 'Roles fetched', data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name, slug, description } = body;
  if (!name || !slug) {
    return NextResponse.json({ success: false, message: 'Name and slug are required' }, { status: 400 });
  }
  const existing = await prisma.role.findFirst({ where: { slug } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Role slug already exists' }, { status: 409 });
  }
  const role = await prisma.role.create({
    data: { name, slug, description: description || null, isSystem: false },
  });
  return NextResponse.json({ success: true, message: 'Role created', data: role }, { status: 201 });
}
