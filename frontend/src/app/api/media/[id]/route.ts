import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Media, User } from '@/database/seeders';
import { getUserIdFromRequest } from '@/lib/auth/server';

export const runtime = 'nodejs';

const include = [{ model: User, as: 'user' }];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const media = await Media.findByPk(parseInt(params.id));
  if (!media) {
    return NextResponse.json({ success: false, message: 'Media not found' }, { status: 404 });
  }
  if (body.altText !== undefined) media.altText = body.altText;
  await media.save();
  const full = await Media.findByPk(media.id, { include });
  return NextResponse.json({ success: true, message: 'Media updated', data: full });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  if (!getUserIdFromRequest(_req)) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }
  const media = await Media.findByPk(parseInt(params.id));
  if (!media) {
    return NextResponse.json({ success: false, message: 'Media not found' }, { status: 404 });
  }
  await media.destroy();
  return NextResponse.json({ success: true, message: 'Media deleted' });
}
