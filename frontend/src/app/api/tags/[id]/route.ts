import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Tag } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const tag = await Tag.findByPk(parseInt(params.id));
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Tag fetched', data: tag });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const tag = await Tag.findByPk(parseInt(params.id));
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  if (body.name !== undefined) {
    tag.name = body.name;
    tag.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  await tag.save();
  return NextResponse.json({ success: true, message: 'Tag updated', data: tag });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const tag = await Tag.findByPk(parseInt(params.id));
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  await tag.destroy();
  return NextResponse.json({ success: true, message: 'Tag deleted' });
}
