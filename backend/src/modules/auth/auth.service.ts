import { User, Role, UserRole, Permission } from '@database/index';
import { hashPassword, comparePassword } from '@utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@utils/jwt';
import { AppError } from '@utils/AppError';
import { USER_STATUS } from '@config/constants';
import { AuthResult, TokenPair } from './auth.types';
import {
  RegisterInput,
  LoginInput,
  RefreshInput,
} from './auth.validation';

function buildTokenPair(userId: string): TokenPair {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('Email is already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    status: USER_STATUS.ACTIVE,
  });

  const userRole = await Role.findOne({ where: { slug: 'user' } });
  if (userRole) {
    await UserRole.create({ userId: user.id, roleId: userRole.id });
  }

  const tokens = buildTokenPair(String(user.id));

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.scope('withPassword').findOne({ where: { email: input.email } });
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw AppError.forbidden('Account is not active');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save({ fields: ['lastLoginAt'] });

  const tokens = buildTokenPair(String(user.id));

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function refresh(input: RefreshInput): Promise<TokenPair> {
  let payload;
  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  if (payload.type !== 'refresh') {
    throw AppError.unauthorized('Invalid token type');
  }

  const user = await User.findByPk(payload.sub);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  return buildTokenPair(String(user.id));
}

export async function getMe(userId: string) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'avatar', 'bio', 'status', 'createdAt'],
    include: [
      {
        model: Role,
        as: 'roles',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
        include: [
          {
            model: Permission,
            as: 'permissions',
            attributes: ['id', 'name', 'slug', 'module', 'description'],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
}
