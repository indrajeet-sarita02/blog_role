import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, Setting } from '@/database/seeders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureDb();
  const settings = await Setting.findAll();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json({ success: true, message: 'Settings fetched', data: result });
}

export async function PUT(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  for (const [key, value] of Object.entries(body)) {
    const existing = await Setting.findOne({ where: { key } });
    if (existing) {
      existing.value = String(value);
      await existing.save();
    } else {
      await Setting.create({ key, value: String(value) });
    }
  }
  const settings = await Setting.findAll();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json({ success: true, message: 'Settings updated', data: result });
}
