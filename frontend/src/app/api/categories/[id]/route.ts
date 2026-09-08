import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Category } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const cat = await Category.findByPk(parseInt(params.id));
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Category fetched', data: cat });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const cat = await Category.findByPk(parseInt(params.id));
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  if (body.name !== undefined) cat.name = body.name;
  if (body.slug !== undefined) cat.slug = body.slug;
  if (body.description !== undefined) cat.description = body.description;
  if (body.parentId !== undefined) cat.parentId = body.parentId;
  if (body.status !== undefined) cat.status = body.status;
  await cat.save();
  return NextResponse.json({ success: true, message: 'Category updated', data: cat });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const cat = await Category.findByPk(parseInt(params.id));
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  await cat.destroy();
  return NextResponse.json({ success: true, message: 'Category deleted' });
}
