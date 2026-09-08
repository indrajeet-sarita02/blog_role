import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Tag } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await ensureDb();
  const tag = await Tag.findOne({ where: { slug: params.slug } });
  if (!tag) {
    return NextResponse.json({ success: false, message: 'Tag not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Tag fetched', data: tag });
}
