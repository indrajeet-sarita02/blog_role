import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const tag = await prisma.tag.findUnique({ where: { id: parseInt(params.id) } });
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Tag fetched', data: tag });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const tag = await prisma.tag.findUnique({ where: { id: parseInt(params.id) } });
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) {
    data.name = body.name;
    data.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  const updated = await prisma.tag.update({ where: { id: tag.id }, data });
  return NextResponse.json({ success: true, message: 'Tag updated', data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const tag = await prisma.tag.findUnique({ where: { id: parseInt(params.id) } });
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  await prisma.tag.delete({ where: { id: tag.id } });
  return NextResponse.json({ success: true, message: 'Tag deleted' });
}
