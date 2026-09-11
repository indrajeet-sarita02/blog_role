import { prisma } from '@/database/prisma';

const S = 'blog_role';

const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS ${S}.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP(3),
    last_login_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON ${S}.users (email);`,
  `CREATE TABLE IF NOT EXISTS ${S}.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS roles_slug_key ON ${S}.roles (slug);`,
  `CREATE TABLE IF NOT EXISTS ${S}.permissions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS permissions_slug_key ON ${S}.permissions (slug);`,
  `CREATE TABLE IF NOT EXISTS ${S}.user_roles (
    user_id INTEGER NOT NULL REFERENCES ${S}.users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES ${S}.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
  );`,
  `CREATE TABLE IF NOT EXISTS ${S}.role_permissions (
    role_id INTEGER NOT NULL REFERENCES ${S}.roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES ${S}.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
  );`,
  `CREATE TABLE IF NOT EXISTS ${S}.categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES ${S}.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON ${S}.categories (slug);`,
  `CREATE TABLE IF NOT EXISTS ${S}.tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS tags_slug_key ON ${S}.tags (slug);`,
  `CREATE TABLE IF NOT EXISTS ${S}.posts (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES ${S}.users(id),
    category_id INTEGER REFERENCES ${S}.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    visibility TEXT NOT NULL DEFAULT 'public',
    published_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP(3)
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_key ON ${S}.posts (slug);`,
  `CREATE INDEX IF NOT EXISTS posts_author_id_idx ON ${S}.posts (author_id);`,
  `CREATE INDEX IF NOT EXISTS posts_category_id_idx ON ${S}.posts (category_id);`,
  `CREATE INDEX IF NOT EXISTS posts_status_published_at_idx ON ${S}.posts (status, published_at);`,
  `CREATE TABLE IF NOT EXISTS ${S}.post_tags (
    post_id INTEGER NOT NULL REFERENCES ${S}.posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES ${S}.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, tag_id)
  );`,
  `CREATE TABLE IF NOT EXISTS ${S}.post_revisions (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES ${S}.posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    revision_number INTEGER NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS post_revisions_post_id_idx ON ${S}.post_revisions (post_id);`,
  `CREATE TABLE IF NOT EXISTS ${S}.comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES ${S}.posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES ${S}.users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES ${S}.comments(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP(3)
  );`,
  `CREATE INDEX IF NOT EXISTS comments_post_id_idx ON ${S}.comments (post_id);`,
  `CREATE INDEX IF NOT EXISTS comments_user_id_idx ON ${S}.comments (user_id);`,
  `CREATE TABLE IF NOT EXISTS ${S}.media (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES ${S}.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP(3)
  );`,
  `CREATE INDEX IF NOT EXISTS media_user_id_idx ON ${S}.media (user_id);`,
  `CREATE TABLE IF NOT EXISTS ${S}.audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES ${S}.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON ${S}.audit_logs (created_at);`,
  `CREATE TABLE IF NOT EXISTS ${S}.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES ${S}.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB,
    read_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON ${S}.notifications (user_id);`,
  `CREATE TABLE IF NOT EXISTS ${S}.settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS settings_key_key ON ${S}.settings (key);`,
];

export async function ensureSchema(): Promise<void> {
  const existing = await prisma.$queryRawUnsafe<
    Array<{ exists: boolean }>
  >(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'blog_role' AND table_name = 'users') AS exists"
  ).catch(() => []);

  if (existing.length > 0 && existing[0].exists === true) return;

  for (const sql of STATEMENTS) {
    await prisma.$executeRawUnsafe(sql);
  }
}