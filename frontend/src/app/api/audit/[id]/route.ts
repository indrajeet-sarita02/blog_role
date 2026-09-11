import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const log = await prisma.auditLog.findUnique({ where: { id: parseInt(params.id) } });
  if (!log) {
    return NextResponse.json({ success: false, message: 'Audit log not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Audit log fetched', data: log });
}
