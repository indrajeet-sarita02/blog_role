import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { memberUserSelect } from '@/database/shapes';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const mediaInclude = { user: { select: memberUserSelect } };

export async function GET(req: NextRequest) {
  await ensureDb();
  const params = req.nextUrl.searchParams;
  const search = params.get('search');
  const page = parseInt(params.get('page') || '1');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);

  if (search) {
    const s = search.toLowerCase();
    const all = await prisma.media.findMany({
      where: { deletedAt: null },
      include: mediaInclude,
    });
    const filtered = all.filter((m) => (m.originalName || '').toLowerCase().includes(s) || (m.altText || '').toLowerCase().includes(s));
    return NextResponse.json({
      success: true, message: 'Media fetched', data: filtered,
      meta: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    });
  }

  const where = { deletedAt: null };
  const [count, rows] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      include: mediaInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);
  return NextResponse.json({
    success: true, message: 'Media fetched', data: rows,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file') as File | null;
  const altText = (formData?.get('altText') as string) || null;
  if (!file) {
    return NextResponse.json({ success: false, message: 'File is required' }, { status: 400 });
  }
  const fileName = file.name || 'upload';
  const media = await prisma.media.create({
    data: {
      userId, fileName, originalName: fileName, mimeType: file.type || 'application/octet-stream',
      fileSize: file.size, url: `/uploads/${fileName}`, altText,
    },
  });
  const full = await prisma.media.findUnique({
    where: { id: media.id },
    include: mediaInclude,
  });
  return NextResponse.json({ success: true, message: 'Media uploaded', data: full }, { status: 201 });
}
