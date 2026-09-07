import { getStore, saveStore, delay, makeSlug, nextId } from '@/lib/mock/store';
import { ApiListResponse, ApiResponse, LoginResponse, User, Permission } from '@/types';

export async function login(email: string, password: string) {
  await delay();
  const store = getStore();
  const user = store.users.find(
    (u) => u.email === email && (u as any)._password === password,
  );
  if (!user) throw new Error('Invalid email or password');
  if (user.status !== 'active') throw new Error('Account is not active');

  const fakeToken = btoa(JSON.stringify({ userId: user.id, ts: Date.now() }));

  return {
    accessToken: fakeToken,
    refreshToken: fakeToken,
  } as LoginResponse;
}

export async function register(name: string, email: string, password: string) {
  await delay();
  const store = getStore();
  if (store.users.find((u) => u.email === email)) {
    throw new Error('Email already registered');
  }

  const userRole = store.roles.find((r) => r.slug === 'user');
  const newUser: User = {
    id: nextId(store, 'user'),
    name,
    email,
    avatar: null,
    bio: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    roles: userRole ? [userRole] : [],
  };

  (newUser as any)._password = password;
  store.users.push(newUser);
  saveStore(store);

  const fakeToken = btoa(JSON.stringify({ userId: newUser.id, ts: Date.now() }));
  return {
    accessToken: fakeToken,
    refreshToken: fakeToken,
  } as LoginResponse;
}

export async function fetchMe() {
  await delay(20);
  const store = getStore();
  const raw = typeof window !== 'undefined' ? window.localStorage.getItem('blog_access_token') : null;
  if (!raw) throw new Error('Not authenticated');

  try {
    const payload = JSON.parse(atob(raw));
    const user = store.users.find((u) => u.id === payload.userId);
    if (!user) throw new Error('User not found');
    const { _password, ...safe } = user as any;
    return safe as User;
  } catch {
    throw new Error('Invalid token');
  }
}

export async function fetchUsers(params?: Record<string, string>) {
  await delay();
  const store = getStore();
  let users = store.users.map((u) => {
    const { _password, ...safe } = u as any;
    return safe as User;
  });

  if (params?.status) users = users.filter((u) => u.status === params.status);
  if (params?.search) {
    const s = params.search.toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  const page = parseInt(params?.page || '1');
  const limit = parseInt(params?.limit || '20');
  const total = users.length;
  const start = (page - 1) * limit;
  const paged = users.slice(start, start + limit);

  return {
    success: true,
    message: 'Users fetched',
    data: paged,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  } as ApiListResponse<User>;
}

export async function fetchUser(id: number) {
  await delay();
  const store = getStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  const { _password, ...safe } = user as any;
  return safe as User;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  roleIds?: number[];
}) {
  await delay();
  const store = getStore();
  if (store.users.find((u) => u.email === payload.email)) {
    throw new Error('Email already in use');
  }

  const userRole = store.roles.find((r) => r.slug === 'user');
  const newUser: User = {
    id: nextId(store, 'user'),
    name: payload.name,
    email: payload.email,
    avatar: null,
    bio: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    roles: payload.roleIds
      ? store.roles.filter((r) => payload.roleIds!.includes(r.id))
      : userRole
        ? [userRole]
        : [],
  };

  (newUser as any)._password = payload.password;
  store.users.push(newUser);
  saveStore(store);
  const { _password, ...safe } = newUser as any;
  return safe as User;
}

export async function updateUser(
  id: number,
  payload: { name?: string; avatar?: string; bio?: string },
) {
  await delay();
  const store = getStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.avatar !== undefined) user.avatar = payload.avatar;
  if (payload.bio !== undefined) user.bio = payload.bio;

  saveStore(store);
  const { _password, ...safe } = user as any;
  return safe as User;
}

export async function updateUserStatus(id: number, status: string) {
  await delay();
  const store = getStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  user.status = status;
  saveStore(store);
  const { _password, ...safe } = user as any;
  return safe as User;
}

export async function updateUserRoles(id: number, roleIds: number[]) {
  await delay();
  const store = getStore();
  const user = store.users.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  user.roles = store.roles.filter((r) => roleIds.includes(r.id));
  saveStore(store);
  const { _password, ...safe } = user as any;
  return safe as User;
}

export async function deleteUser(id: number) {
  await delay();
  const store = getStore();
  store.users = store.users.filter((u) => u.id !== id);
  saveStore(store);
}
