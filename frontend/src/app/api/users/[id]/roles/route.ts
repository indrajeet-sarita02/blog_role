import { NextRequest, NextResponse } from 'next/server';
import { ensureDb, User, Role, UserRole, sequelize } from '@/database/seeders';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json().catch(() => ({}));
  const userId = parseInt(params.id);
  const { roleIds } = body;
  if (!Array.isArray(roleIds)) {
    return NextResponse.json({ success: false, message: 'roleIds is required' }, { status: 400 });
  }
  const user = await User.findByPk(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  await sequelize.transaction(async (t) => {
    await UserRole.destroy({ where: { userId }, transaction: t });
    if (roleIds.length) {
      await UserRole.bulkCreate(roleIds.map((rid: number) => ({ userId, roleId: rid })), { transaction: t });
    }
  });
  const full = await User.findOne({ where: { id: userId }, include: [{ model: Role, as: 'roles' }] });
  return NextResponse.json({ success: true, message: 'User roles updated', data: full });
}
