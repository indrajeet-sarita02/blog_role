import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDb } from '@/database';
import { getUserWithRoles } from '@/database/shapes';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
  }
  if (user.status !== 'active') {
    return NextResponse.json({ success: false, message: 'Account is not active' }, { status: 403 });
  }

  const accessToken = signToken(user.id);
  const refreshToken = accessToken;

  const userWithRoles = await getUserWithRoles(user.id);

  return NextResponse.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken, user: userWithRoles },
  });
}
