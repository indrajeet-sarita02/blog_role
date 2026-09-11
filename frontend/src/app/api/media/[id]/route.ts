import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const mediaInclude = { user: { select: memberUserSelect } };

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const media = await prisma.media.findUnique({
    where: { id: parseInt(params.id), deletedAt: null },
  });
  if (!media) {
    return NextResponse.json({ success: false, message: 'Media not found' }, { status: 404 });
  }
  await prisma.media.update({
    where: { id: media.id },
    data: body.altText !== undefined ? { altText: body.altText } : {},
  });
  const full = await prisma.media.findUnique({
    where: { id: media.id },
    include: mediaInclude,
  });
  return NextResponse.json({ success: true, message: 'Media updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(_req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const media = await prisma.media.findUnique({
    where: { id: parseInt(params.id), deletedAt: null },
  });
  if (!media) {
    return NextResponse.json({ success: false, message: 'Media not found' }, { status: 404 });
  }
  await prisma.media.updateMany({
    where: { id: media.id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ success: true, message: 'Media deleted' });
}
