import {
  User,
  Role,
  Permission,
  Category,
  Tag,
  Post,
  Comment,
  Media,
  Notification,
  PostRevision,
} from '@/types';

const STORAGE_KEY = 'blog_mock_store';
const STORE_VERSION = 2;

export interface AuditLogEntry {
  id: number;
  actorId: number;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: number; name: string; email: string } | null;
}

export interface Settings {
  [key: string]: string;
}

export interface MockStore {
  version?: number;
  users: User[];
  roles: Role[];
  permissions: Permission[];
  categories: Category[];
  tags: Tag[];
  posts: Post[];
  comments: Comment[];
  media: Media[];
  notifications: Notification[];
  postRevisions: PostRevision[];
  auditLogs: AuditLogEntry[];
  settings: Settings;
  nextIds: Record<string, number>;
}

let _store: MockStore | null = null;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateId(store: MockStore, entity: string): number {
  if (!store.nextIds[entity]) store.nextIds[entity] = 1;
  return store.nextIds[entity]++;
}

function now(): string {
  return new Date().toISOString();
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function createSeedStore(): MockStore {
  const store: MockStore = {
    users: [],
    roles: [],
    permissions: [],
    categories: [],
    tags: [],
    posts: [],
    comments: [],
    media: [],
    notifications: [],
    postRevisions: [],
    auditLogs: [],
    settings: {},
    nextIds: {},
  };

  const PERMISSIONS: Array<{ name: string; slug: string; module: string }> = [
    { name: 'Create Blog', slug: 'blog.create', module: 'blog' },
    { name: 'View Blog', slug: 'blog.view', module: 'blog' },
    { name: 'View All Blogs', slug: 'blog.viewAny', module: 'blog' },
    { name: 'Update Blog', slug: 'blog.update', module: 'blog' },
    { name: 'Update Any Blog', slug: 'blog.updateAny', module: 'blog' },
    { name: 'Delete Blog', slug: 'blog.delete', module: 'blog' },
    { name: 'Delete Any Blog', slug: 'blog.deleteAny', module: 'blog' },
    { name: 'Publish Blog', slug: 'blog.publish', module: 'blog' },
    { name: 'Approve Blog', slug: 'blog.approve', module: 'blog' },
    { name: 'Reject Blog', slug: 'blog.reject', module: 'blog' },
    { name: 'Archive Blog', slug: 'blog.archive', module: 'blog' },
    { name: 'Create Comment', slug: 'comment.create', module: 'comment' },
    { name: 'View Comment', slug: 'comment.view', module: 'comment' },
    { name: 'View All Comments', slug: 'comment.viewAny', module: 'comment' },
    { name: 'Update Comment', slug: 'comment.update', module: 'comment' },
    { name: 'Update Any Comment', slug: 'comment.updateAny', module: 'comment' },
    { name: 'Delete Comment', slug: 'comment.delete', module: 'comment' },
    { name: 'Delete Any Comment', slug: 'comment.deleteAny', module: 'comment' },
    { name: 'Approve Comment', slug: 'comment.approve', module: 'comment' },
    { name: 'Reject Comment', slug: 'comment.reject', module: 'comment' },
    { name: 'Create User', slug: 'user.create', module: 'user' },
    { name: 'View User', slug: 'user.view', module: 'user' },
    { name: 'Update User', slug: 'user.update', module: 'user' },
    { name: 'Delete User', slug: 'user.delete', module: 'user' },
    { name: 'Activate User', slug: 'user.activate', module: 'user' },
    { name: 'Deactivate User', slug: 'user.deactivate', module: 'user' },
    { name: 'Create Role', slug: 'role.create', module: 'role' },
    { name: 'View Role', slug: 'role.view', module: 'role' },
    { name: 'Update Role', slug: 'role.update', module: 'role' },
    { name: 'Delete Role', slug: 'role.delete', module: 'role' },
    { name: 'Assign Permission', slug: 'role.assignPermission', module: 'role' },
    { name: 'View Permission', slug: 'permission.view', module: 'permission' },
    { name: 'Create Category', slug: 'category.create', module: 'category' },
    { name: 'View Category', slug: 'category.view', module: 'category' },
    { name: 'Update Category', slug: 'category.update', module: 'category' },
    { name: 'Delete Category', slug: 'category.delete', module: 'category' },
    { name: 'Create Tag', slug: 'tag.create', module: 'tag' },
    { name: 'View Tag', slug: 'tag.view', module: 'tag' },
    { name: 'Update Tag', slug: 'tag.update', module: 'tag' },
    { name: 'Delete Tag', slug: 'tag.delete', module: 'tag' },
    { name: 'Upload Media', slug: 'media.upload', module: 'media' },
    { name: 'View Media', slug: 'media.view', module: 'media' },
    { name: 'Delete Media', slug: 'media.delete', module: 'media' },
    { name: 'View Audit', slug: 'audit.view', module: 'audit' },
    { name: 'View Settings', slug: 'settings.view', module: 'settings' },
    { name: 'Update Settings', slug: 'settings.update', module: 'settings' },
  ];

  PERMISSIONS.forEach((p) => {
    store.permissions.push({ id: generateId(store, 'permission'), ...p, description: null });
  });

  const permBySlug = new Map(store.permissions.map((p) => [p.slug, p]));

  const ROLE_DEFS: Array<{ name: string; slug: string; description: string; isSystem: boolean; perms: string[] }> = [
    {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Complete system access',
      isSystem: true,
      perms: PERMISSIONS.map((p) => p.slug),
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative and content management access',
      isSystem: true,
      perms: PERMISSIONS.filter((p) => !p.slug.startsWith('role.')).map((p) => p.slug),
    },
    {
      name: 'Editor',
      slug: 'editor',
      description: 'Can manage and approve content',
      isSystem: true,
      perms: [
        'blog.create', 'blog.view', 'blog.viewAny', 'blog.update', 'blog.updateAny',
        'blog.delete', 'blog.deleteAny', 'blog.publish', 'blog.approve',
        'blog.reject', 'blog.archive',
        'comment.create', 'comment.view', 'comment.viewAny', 'comment.update', 'comment.updateAny',
        'comment.delete', 'comment.deleteAny', 'comment.approve', 'comment.reject',
        'category.create', 'category.view', 'category.update', 'category.delete',
        'tag.create', 'tag.view', 'tag.update', 'tag.delete',
        'media.upload', 'media.view', 'media.delete',
      ],
    },
    {
      name: 'Author',
      slug: 'author',
      description: 'Can create and manage own posts',
      isSystem: true,
      perms: [
        'blog.create', 'blog.view', 'blog.update', 'blog.delete', 'blog.publish',
        'comment.create', 'comment.view', 'comment.update', 'comment.delete',
        'media.upload', 'media.view',
      ],
    },
    {
      name: 'Contributor',
      slug: 'contributor',
      description: 'Can create posts and submit them for review',
      isSystem: true,
      perms: [
        'blog.create', 'blog.view', 'blog.update', 'blog.delete',
        'comment.create', 'comment.view', 'comment.update', 'comment.delete',
      ],
    },
    {
      name: 'User',
      slug: 'user',
      description: 'Can read, comment, reply, and manage own comments',
      isSystem: true,
      perms: [
        'blog.view', 'comment.create', 'comment.view', 'comment.update', 'comment.delete',
      ],
    },
  ];

  ROLE_DEFS.forEach((r) => {
    store.roles.push({
      id: generateId(store, 'role'),
      name: r.name,
      slug: r.slug,
      description: r.description,
      isSystem: r.isSystem,
      permissions: r.perms.map((s) => permBySlug.get(s)!).filter(Boolean),
    });
  });

  const roleBySlug = new Map(store.roles.map((r) => [r.slug, r]));

  const DEFAULT_ADMIN = { name: 'Super Admin', email: 'admin@example.com', password: 'admin123', role: 'super-admin' };
  const SAMPLE_USERS = [
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'author' },
    { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', role: 'editor' },
    { name: 'Carol White', email: 'carol@example.com', password: 'password123', role: 'user' },
    { name: 'Dave Brown', email: 'dave@example.com', password: 'password123', role: 'author' },
  ];

  const allUsers = [DEFAULT_ADMIN, ...SAMPLE_USERS];
  allUsers.forEach((u) => {
    store.users.push({
      id: generateId(store, 'user'),
      name: u.name,
      email: u.email,
      avatar: null,
      bio: null,
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
      roles: [roleBySlug.get(u.role)!],
      _password: u.password,
    } as User & { _password: string });
  });

  const CATEGORIES = [
    { name: 'Technology', description: 'News, tutorials and insights about technology.' },
    { name: 'Lifestyle', description: 'Everyday living, wellness and personal experiences.' },
    { name: 'Travel', description: 'Destinations, guides and travel tips.' },
    { name: 'Food', description: 'Recipes, restaurants and culinary adventures.' },
    { name: 'Business', description: 'Entrepreneurship, startups and market trends.' },
    { name: 'Science', description: 'Discoveries, research and the natural world.' },
  ];

  CATEGORIES.forEach((c) => {
    store.categories.push({
      id: generateId(store, 'category'),
      name: c.name,
      slug: slugify(c.name),
      description: c.description,
      status: 'active',
      parentId: null,
    });
  });

  const TAGS = [
    'javascript', 'web-development', 'react', 'nodejs', 'productivity',
    'health', 'budget-travel', 'recipes', 'startup', 'artificial-intelligence',
    'space', 'mindfulness',
  ];

  TAGS.forEach((t) => {
    store.tags.push({
      id: generateId(store, 'tag'),
      name: t,
      slug: t,
    });
  });

  const categoryBySlug = new Map(store.categories.map((c) => [c.slug, c]));
  const tagByName = new Map(store.tags.map((t) => [t.name, t]));

  const SAMPLE_POSTS: Array<{
    title: string;
    authorEmail: string;
    categorySlug: string;
    excerpt: string;
    content: string;
    tagNames: string[];
    status: string;
    publishedAt?: string;
  }> = [
    {
      title: 'Getting Started with TypeScript in Node.js',
      authorEmail: 'alice@example.com',
      categorySlug: 'technology',
      excerpt: 'A practical introduction to adding type safety to your Node.js applications.',
      content: 'TypeScript brings static typing to JavaScript, catching errors before you run your code.\n\nIn this post we explore setting up ts-node, configuring tsconfig.json, and sharing types between frontend and backend.\n\nThe biggest win is confidence: refactoring becomes safe and your IDE becomes a powerful ally.',
      tagNames: ['javascript', 'react', 'nodejs'],
      status: 'published',
      publishedAt: '2026-08-01T09:00:00Z',
    },
    {
      title: 'Building a REST API with Express and Sequelize',
      authorEmail: 'bob@example.com',
      categorySlug: 'technology',
      excerpt: 'Learn how to structure a scalable Express API backed by an ORM.',
      content: 'A well-structured Express application separates concerns into routes, controllers, services and models.\n\nWe walk through authentication with JWT, validating input with Zod, and permission-based access control.\n\nTransactions keep your database consistent even when operations touch multiple tables.',
      tagNames: ['web-development', 'nodejs'],
      status: 'published',
      publishedAt: '2026-08-05T14:30:00Z',
    },
    {
      title: '10 Daily Habits to Boost Your Productivity',
      authorEmail: 'alice@example.com',
      categorySlug: 'lifestyle',
      excerpt: 'Small, consistent daily habits that compound into big results.',
      content: 'Productivity is not about doing more, it is about doing the right things.\n\nStart your day by prioritizing three key tasks. Use focused work blocks and eliminate distractions.\n\nRegular reflection helps you double down on what works and drop what does not.',
      tagNames: ['productivity', 'mindfulness'],
      status: 'published',
      publishedAt: '2026-08-10T07:00:00Z',
    },
    {
      title: 'A Weekend Guide to Budget Travel in Southeast Asia',
      authorEmail: 'dave@example.com',
      categorySlug: 'travel',
      excerpt: 'Travel more while spending less with these budget-friendly tips.',
      content: 'Exploring Southeast Asia does not have to break the bank.\n\nStay in local guesthouses, eat street food, and travel by bus or train instead of flying.\n\nA little planning goes a long way toward an unforgettable yet affordable adventure.',
      tagNames: ['budget-travel'],
      status: 'published',
      publishedAt: '2026-08-14T11:00:00Z',
    },
    {
      title: 'The Art of Making Perfect Sourdough Bread',
      authorEmail: 'bob@example.com',
      categorySlug: 'food',
      excerpt: 'Master the slow fermentation process behind a crusty, tangy loaf.',
      content: 'Good sourdough starts with a healthy, active starter.\n\nFermentation develops flavor and structure over time. Patience is your most important ingredient.\n\nWith a few simple techniques you can bake bread that rivals your local bakery.',
      tagNames: ['recipes', 'mindfulness'],
      status: 'published',
      publishedAt: '2026-08-18T16:00:00Z',
    },
    {
      title: 'Lessons Learned from My First Startup',
      authorEmail: 'alice@example.com',
      categorySlug: 'business',
      excerpt: 'Honest reflections on building a company from zero to launch.',
      content: 'Founding a startup is equal parts exhilarating and terrifying.\n\nTalk to customers early and often. Ship quickly and iterate based on feedback.\n\nMost importantly, protect your time and energy; resilience is the real currency.',
      tagNames: ['startup'],
      status: 'published',
      publishedAt: '2026-08-22T10:00:00Z',
    },
    {
      title: 'How Artificial Intelligence Is Changing the Web',
      authorEmail: 'bob@example.com',
      categorySlug: 'technology',
      excerpt: 'From chatbots to code generation, AI is reshaping development.',
      content: 'AI tools are increasingly embedded in the developer workflow.\n\nThey help with boilerplate, testing, and even database query generation.\n\nHuman judgment remains essential, but the craft of software is evolving quickly.',
      tagNames: ['artificial-intelligence', 'javascript'],
      status: 'published',
      publishedAt: '2026-08-25T09:00:00Z',
    },
    {
      title: 'What We Learned from the Latest Space Missions',
      authorEmail: 'dave@example.com',
      categorySlug: 'science',
      excerpt: 'A roundup of the most exciting discoveries from recent missions.',
      content: 'Humanity is venturing further into the solar system than ever before.\n\nNew telescopes and probes are revealing the history of our universe in stunning detail.\n\nEach mission answers old questions and raises exciting new ones.',
      tagNames: ['space'],
      status: 'published',
      publishedAt: '2026-08-28T13:00:00Z',
    },
    {
      title: 'Introduction to Mindfulness for Busy People',
      authorEmail: 'carol@example.com',
      categorySlug: 'lifestyle',
      excerpt: 'Five-minute practices to reduce stress and stay focused.',
      content: 'Mindfulness does not require an hour of meditation each day.\n\nSimple breathing exercises and short pauses can reset your attention.\n\nIntegrate these micro-practices into your routine for calmer, clearer days.',
      tagNames: ['mindfulness', 'productivity'],
      status: 'published',
      publishedAt: '2026-08-30T08:00:00Z',
    },
  ];

  const userByEmail = new Map(store.users.map((u) => [u.email, u]));
  const allTags = store.tags;

  SAMPLE_POSTS.forEach((p, idx) => {
    const author = userByEmail.get(p.authorEmail)!;
    const category = categoryBySlug.get(p.categorySlug);
    const postTags = p.tagNames.map((n) => tagByName.get(n)!).filter(Boolean);
    const postId = generateId(store, 'post');
    const pubDate = p.publishedAt || null;

    store.posts.push({
      id: postId,
      authorId: author.id,
      categoryId: category?.id || null,
      title: p.title,
      slug: slugify(p.title),
      excerpt: p.excerpt,
      content: p.content,
      featuredImage: null,
      status: p.status as any,
      visibility: 'public',
      publishedAt: pubDate,
      createdAt: pubDate || '2026-08-01T00:00:00Z',
      updatedAt: pubDate || '2026-08-01T00:00:00Z',
      author: { id: author.id, name: author.name, email: author.email, avatar: null, bio: null, status: 'active' },
      category: category || null,
      tags: postTags,
    });

    store.postRevisions.push({
      id: generateId(store, 'postRevision'),
      postId,
      userId: author.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      featuredImage: null,
      revisionNumber: 1,
      createdAt: pubDate || '2026-08-01T00:00:00Z',
    });
  });

  const SAMPLE_COMMENTS: Array<{ postIndex: number; authorEmail: string; content: string; parentIndex?: number }> = [
    { postIndex: 0, authorEmail: 'carol@example.com', content: 'Great introduction! The setup section saved me a lot of time.' },
    { postIndex: 0, authorEmail: 'dave@example.com', content: 'Would love to see a follow-up on decorators and DI.' },
    { postIndex: 1, authorEmail: 'alice@example.com', content: 'The transaction example was really helpful, thanks!' },
    { postIndex: 2, authorEmail: 'carol@example.com', content: 'Number 3 and 7 made the biggest difference for me.' },
    { postIndex: 2, authorEmail: 'carol@example.com', content: 'How do you handle notifications during focus blocks?', parentIndex: 2 },
    { postIndex: 4, authorEmail: 'carol@example.com', content: 'My starter always fails. Any troubleshooting tips?' },
    { postIndex: 5, authorEmail: 'dave@example.com', content: 'So inspiring. Starting my own company next month!' },
    { postIndex: 6, authorEmail: 'alice@example.com', content: 'AI definitely speeds up my prototyping work.' },
    { postIndex: 7, authorEmail: 'carol@example.com', content: 'The images from the telescope are just breathtaking.' },
    { postIndex: 8, authorEmail: 'alice@example.com', content: 'I use the 5-minute breathing routine daily now.' },
  ];

  const createdComments: Comment[] = [];
  SAMPLE_COMMENTS.forEach((c) => {
    const post = store.posts[c.postIndex];
    const user = userByEmail.get(c.authorEmail)!;
    const commentId = generateId(store, 'comment');
    const parentId = c.parentIndex !== undefined ? createdComments[c.parentIndex]?.id || null : null;

    const comment: Comment = {
      id: commentId,
      postId: post.id,
      userId: user.id,
      parentId,
      content: c.content,
      status: 'approved',
      createdAt: '2026-08-15T10:00:00Z',
      user: { id: user.id, name: user.name, email: user.email, avatar: null, bio: null, status: 'active' },
    };
    store.comments.push(comment);
    createdComments.push(comment);
  });

  const SAMPLE_MEDIA = [
    { authorEmail: 'alice@example.com', fileName: 'code-on-screen.png', originalName: 'code-on-screen.png', mimeType: 'image/png', altText: 'Code on a screen' },
    { authorEmail: 'alice@example.com', fileName: 'productivity-desk.jpg', originalName: 'productivity-desk.jpg', mimeType: 'image/jpeg', altText: 'A tidy productivity desk' },
    { authorEmail: 'bob@example.com', fileName: 'sourdough-loaf.jpg', originalName: 'sourdough-loaf.jpg', mimeType: 'image/jpeg', altText: 'A freshly baked sourdough loaf' },
    { authorEmail: 'dave@example.com', fileName: 'tropical-beach.jpg', originalName: 'tropical-beach.jpg', mimeType: 'image/jpeg', altText: 'A tropical beach at sunset' },
  ];

  SAMPLE_MEDIA.forEach((m) => {
    const user = userByEmail.get(m.authorEmail)!;
    store.media.push({
      id: generateId(store, 'media'),
      userId: user.id,
      fileName: m.fileName,
      originalName: m.originalName,
      mimeType: m.mimeType,
      fileSize: 122880,
      url: `/uploads/${m.fileName}`,
      altText: m.altText,
      createdAt: '2026-08-01T00:00:00Z',
    });
  });

  store.settings = {
    'site.title': 'My Blog',
    'site.tagline': 'Thoughts on technology, life and everything in between',
    'site.description': 'A modern blog built with Next.js, Node.js and SQLite',
    'site.posts_per_page': '10',
    'site.comments_enabled': 'true',
    'site.content_direction': 'ltr',
    'site.locale': 'en-US',
    'site.time_zone': 'UTC',
  };

  store.notifications.push({
    id: generateId(store, 'notification'),
    userId: store.users[0].id,
    type: 'system',
    title: 'Welcome to the Blog',
    message: 'Your account has been set up successfully.',
    data: null,
    readAt: null,
    createdAt: now(),
  });

  store.auditLogs.push({
    id: generateId(store, 'auditLog'),
    actorId: store.users[0].id,
    action: 'system.seed',
    module: 'system',
    entityType: null,
    entityId: null,
    ipAddress: '127.0.0.1',
    userAgent: 'Mock Store',
    oldValues: null,
    newValues: null,
    createdAt: now(),
    actor: { id: store.users[0].id, name: store.users[0].name, email: store.users[0].email },
  });

  store.version = STORE_VERSION;

  return store;
}

function isValidStore(raw: unknown): raw is MockStore {
  if (typeof raw !== 'object' || raw === null) return false;
  const s = raw as MockStore;
  if (s.version !== STORE_VERSION) return false;
  return Array.isArray(s.users)
    && Array.isArray(s.roles)
    && Array.isArray(s.permissions)
    && Array.isArray(s.categories)
    && Array.isArray(s.tags)
    && Array.isArray(s.posts)
    && Array.isArray(s.comments)
    && Array.isArray(s.media)
    && Array.isArray(s.notifications)
    && Array.isArray(s.postRevisions)
    && Array.isArray(s.auditLogs)
    && s.settings !== null
    && typeof s.settings === 'object'
    && typeof s.nextIds === 'object'
    && s.nextIds !== null;
}

function loadStore(): MockStore {
  if (typeof window === 'undefined') return createSeedStore();
  if (_store) return _store;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidStore(parsed)) {
        _store = parsed;
        return _store;
      }
    }
  } catch {
    // ignore
  }

  _store = createSeedStore();
  persist(_store);
  return _store!;
}

function persist(store: MockStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function getStore(): MockStore {
  return loadStore();
}

export function saveStore(store: MockStore) {
  _store = store;
  persist(store);
}

export function resetStore() {
  _store = createSeedStore();
  persist(_store);
}

export function nextId(store: MockStore, entity: string): number {
  return generateId(store, entity);
}

export function makeSlug(text: string): string {
  return slugify(text);
}

export function delay(ms = 50): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
