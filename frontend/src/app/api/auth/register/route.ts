import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User, Role, UserRole } from '@/database/seeders';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, avatar: null, bio: null, status: 'active' });

  const userRole = await Role.findOne({ where: { slug: 'user' } });
  if (userRole) {
    await UserRole.create({ userId: user.id, roleId: userRole.id });
  }

  const accessToken = signToken(user.id);
  const userWithRoles = await User.findOne({
    where: { id: user.id },
    include: [{ model: Role, as: 'roles' }],
  });

  return NextResponse.json({
    success: true,
    message: 'Registration successful',
    data: { accessToken, refreshToken: accessToken, user: userWithRoles },
  }, { status: 201 });
}
