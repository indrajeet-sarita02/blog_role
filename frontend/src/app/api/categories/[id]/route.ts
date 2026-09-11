import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const cat = await prisma.category.findUnique({ where: { id: parseInt(params.id) } });
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Category fetched', data: cat });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const cat = await prisma.category.findUnique({ where: { id: parseInt(params.id) } });
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.description !== undefined) data.description = body.description;
  if (body.parentId !== undefined) data.parentId = body.parentId;
  if (body.status !== undefined) data.status = body.status;
  const updated = await prisma.category.update({ where: { id: cat.id }, data });
  return NextResponse.json({ success: true, message: 'Category updated', data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const cat = await prisma.category.findUnique({ where: { id: parseInt(params.id) } });
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  await prisma.category.delete({ where: { id: cat.id } });
  return NextResponse.json({ success: true, message: 'Category deleted' });
}
