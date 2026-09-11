import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await ensureDb();
  const cat = await prisma.category.findFirst({ where: { slug: params.slug, status: 'active' } });
  if (!cat) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Category fetched', data: cat });
}
