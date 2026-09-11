import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureDb();
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json({ success: true, message: 'Settings fetched', data: result });
}

export async function PUT(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  for (const [key, value] of Object.entries(body)) {
    const existing = await prisma.setting.findFirst({ where: { key } });
    if (existing) {
      await prisma.setting.update({ where: { id: existing.id }, data: { value: String(value) } });
    } else {
      await prisma.setting.create({ data: { key, value: String(value) } });
    }
  }
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json({ success: true, message: 'Settings updated', data: result });
}
