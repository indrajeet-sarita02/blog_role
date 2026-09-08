import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, AuditLog } from '@/database/seeders';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const log = await AuditLog.findByPk(parseInt(params.id));
  if (!log) {
    return NextResponse.json({ success: false, message: 'Audit log not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Audit log fetched', data: log });
}
