import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User, Role, UserRole } from '@/database/seeders';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
  }

  const user = await User.scope('withPassword').findOne({ where: { email } });
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

  const userWithRoles = await User.findOne({
    where: { id: user.id },
    include: [{ model: Role, as: 'roles' }],
  });

  return NextResponse.json({
    success: true,
    message: 'Login successful',
    data: { accessToken, refreshToken, user: userWithRoles },
  });
}
