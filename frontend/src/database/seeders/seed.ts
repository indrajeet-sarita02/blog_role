import { initDatabase, sequelize } from '@/database';
import User from '@/database/models/User';
import Role from '@/database/models/Role';
import Permission from '@/database/models/Permission';
import UserRole from '@/database/models/UserRole';
import RolePermission from '@/database/models/RolePermission';
import Category from '@/database/models/Category';
import Tag from '@/database/models/Tag';
import Post from '@/database/models/Post';
import PostTag from '@/database/models/PostTag';
import PostRevision from '@/database/models/PostRevision';
import Comment from '@/database/models/Comment';
import Media from '@/database/models/Media';
import AuditLog from '@/database/models/AuditLog';
import Notification from '@/database/models/Notification';
import Setting from '@/database/models/Setting';
import bcrypt from 'bcrypt';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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

const SAMPLE_USERS: Array<{ name: string; email: string; password: string; role: string }> = [
  { name: 'Super Admin', email: 'admin@example.com', password: 'admin123', role: 'super-admin' },
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'author' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', role: 'editor' },
  { name: 'Carol White', email: 'carol@example.com', password: 'password123', role: 'user' },
  { name: 'Dave Brown', email: 'dave@example.com', password: 'password123', role: 'author' },
];

const CATEGORIES = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Business', 'Science'];

const TAGS = [
  'javascript', 'web-development', 'react', 'nodejs', 'productivity',
  'health', 'budget-travel', 'recipes', 'startup', 'artificial-intelligence',
  'space', 'mindfulness',
];

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
  { title: 'Getting Started with TypeScript in Node.js', authorEmail: 'alice@example.com', categorySlug: 'technology', excerpt: 'A practical introduction to adding type safety to your Node.js applications.', content: 'TypeScript brings static typing to JavaScript, catching errors before you run your code.', tagNames: ['javascript', 'react', 'nodejs'], status: 'published', publishedAt: '2026-08-01T09:00:00Z' },
  { title: 'Building a REST API with Express and Sequelize', authorEmail: 'bob@example.com', categorySlug: 'technology', excerpt: 'Learn how to structure a scalable Express API backed by an ORM.', content: 'A well-structured Express application separates concerns into routes, controllers, services and models.', tagNames: ['web-development', 'nodejs'], status: 'published', publishedAt: '2026-08-05T14:30:00Z' },
  { title: '10 Daily Habits to Boost Your Productivity', authorEmail: 'alice@example.com', categorySlug: 'lifestyle', excerpt: 'Small, consistent daily habits that compound into big results.', content: 'Productivity is not about doing more, it is about doing the right things.', tagNames: ['productivity', 'mindfulness'], status: 'published', publishedAt: '2026-08-10T07:00:00Z' },
  { title: 'A Weekend Guide to Budget Travel in Southeast Asia', authorEmail: 'dave@example.com', categorySlug: 'travel', excerpt: 'Travel more while spending less with these budget-friendly tips.', content: 'Exploring Southeast Asia does not have to break the bank.', tagNames: ['budget-travel'], status: 'published', publishedAt: '2026-08-14T11:00:00Z' },
  { title: 'The Art of Making Perfect Sourdough Bread', authorEmail: 'bob@example.com', categorySlug: 'food', excerpt: 'Master the slow fermentation process behind a crusty, tangy loaf.', content: 'Good sourdough starts with a healthy, active starter.', tagNames: ['recipes', 'mindfulness'], status: 'published', publishedAt: '2026-08-18T16:00:00Z' },
  { title: 'Lessons Learned from My First Startup', authorEmail: 'alice@example.com', categorySlug: 'business', excerpt: 'Honest reflections on building a company from zero to launch.', content: 'Founding a startup is equal parts exhilarating and terrifying.', tagNames: ['startup'], status: 'published', publishedAt: '2026-08-22T10:00:00Z' },
  { title: 'How Artificial Intelligence Is Changing the Web', authorEmail: 'bob@example.com', categorySlug: 'technology', excerpt: 'From chatbots to code generation, AI is reshaping development.', content: 'AI tools are increasingly embedded in the developer workflow.', tagNames: ['artificial-intelligence', 'javascript'], status: 'published', publishedAt: '2026-08-25T09:00:00Z' },
  { title: 'What We Learned from the Latest Space Missions', authorEmail: 'dave@example.com', categorySlug: 'science', excerpt: 'A roundup of the most exciting discoveries from recent missions.', content: "Humanity is venturing further into the solar system than ever before.", tagNames: ['space'], status: 'published', publishedAt: '2026-08-28T13:00:00Z' },
  { title: 'Introduction to Mindfulness for Busy People', authorEmail: 'carol@example.com', categorySlug: 'lifestyle', excerpt: 'Five-minute practices to reduce stress and stay focused.', content: 'Mindfulness does not require an hour of meditation each day.', tagNames: ['mindfulness', 'productivity'], status: 'published', publishedAt: '2026-08-30T08:00:00Z' },
];

const SAMPLE_COMMENTS: Array<{ postTitle: string; authorEmail: string; content: string }> = [
  { postTitle: 'Getting Started with TypeScript in Node.js', authorEmail: 'carol@example.com', content: 'Great introduction! The setup section saved me a lot of time.' },
  { postTitle: 'Getting Started with TypeScript in Node.js', authorEmail: 'dave@example.com', content: 'Would love to see a follow-up on decorators and DI.' },
  { postTitle: 'Building a REST API with Express and Sequelize', authorEmail: 'alice@example.com', content: 'The transaction example was really helpful, thanks!' },
  { postTitle: '10 Daily Habits to Boost Your Productivity', authorEmail: 'carol@example.com', content: 'Number 3 and 7 made the biggest difference for me.' },
  { postTitle: '10 Daily Habits to Boost Your Productivity', authorEmail: 'carol@example.com', content: 'How do you handle notifications during focus blocks?' },
  { postTitle: 'The Art of Making Perfect Sourdough Bread', authorEmail: 'carol@example.com', content: 'My starter always fails. Any troubleshooting tips?' },
  { postTitle: 'Lessons Learned from My First Startup', authorEmail: 'dave@example.com', content: 'So inspiring. Starting my own company next month!' },
  { postTitle: 'How Artificial Intelligence Is Changing the Web', authorEmail: 'alice@example.com', content: 'AI definitely speeds up my prototyping work.' },
  { postTitle: 'What We Learned from the Latest Space Missions', authorEmail: 'carol@example.com', content: 'The images from the telescope are just breathtaking.' },
  { postTitle: 'Introduction to Mindfulness for Busy People', authorEmail: 'alice@example.com', content: 'I use the 5-minute breathing routine daily now.' },
];

const SETTINGS: Record<string, string> = {
  'site.title': 'My Blog',
  'site.tagline': 'Thoughts on technology, life and everything in between',
  'site.description': 'A modern blog built with Next.js, Node.js and SQLite',
  'site.posts_per_page': '10',
  'site.comments_enabled': 'true',
  'site.content_direction': 'ltr',
  'site.locale': 'en-US',
  'site.time_zone': 'UTC',
};

export async function seedDatabase() {
  await initDatabase();

  const count = await User.count();
  if (count > 0) return; // already seeded

  const t = await sequelize.transaction();

  try {
    // Permissions
    const permRecords = await Permission.bulkCreate(
      PERMISSIONS.map((p) => ({ name: p.name, slug: p.slug, module: p.module, description: null })),
      { transaction: t },
    );
    const permBySlug = new Map(permRecords.map((p) => [p.slug, p.id]));

    const roleDefs = [
      { name: 'Super Admin', slug: 'super-admin', perms: PERMISSIONS.map((p) => p.slug), isSystem: true },
      { name: 'Admin', slug: 'admin', perms: PERMISSIONS.filter((p) => !p.slug.startsWith('role.')).map((p) => p.slug), isSystem: true },
      {
        name: 'Editor', slug: 'editor', isSystem: true,
        perms: ['blog.create', 'blog.view', 'blog.viewAny', 'blog.update', 'blog.updateAny', 'blog.delete', 'blog.deleteAny', 'blog.publish', 'blog.approve', 'blog.reject', 'blog.archive', 'comment.create', 'comment.view', 'comment.viewAny', 'comment.update', 'comment.updateAny', 'comment.delete', 'comment.deleteAny', 'comment.approve', 'comment.reject', 'category.create', 'category.view', 'category.update', 'category.delete', 'tag.create', 'tag.view', 'tag.update', 'tag.delete', 'media.upload', 'media.view', 'media.delete'],
      },
      {
        name: 'Author', slug: 'author', isSystem: true,
        perms: ['blog.create', 'blog.view', 'blog.update', 'blog.delete', 'blog.publish', 'comment.create', 'comment.view', 'comment.update', 'comment.delete', 'media.upload', 'media.view'],
      },
      {
        name: 'Contributor', slug: 'contributor', isSystem: true,
        perms: ['blog.create', 'blog.view', 'blog.update', 'blog.delete', 'comment.create', 'comment.view', 'comment.update', 'comment.delete'],
      },
      {
        name: 'User', slug: 'user', isSystem: true,
        perms: ['blog.view', 'comment.create', 'comment.view', 'comment.update', 'comment.delete'],
      },
    ];

    const roles: Role[] = [];
    for (const r of roleDefs) {
      const role = await Role.create({ name: r.name, slug: r.slug, description: null, isSystem: r.isSystem }, { transaction: t });
      roles.push(role);
      if (r.perms.length) {
        await RolePermission.bulkCreate(r.perms.map((s) => ({ roleId: role.id, permissionId: permBySlug.get(s)! })), { transaction: t });
      }
    }
    const roleBySlug = new Map(roles.map((r) => [r.slug, r]));

    // Users
    const users: User[] = [];
    for (const u of SAMPLE_USERS) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await User.create({ name: u.name, email: u.email, passwordHash, avatar: null, bio: null, status: 'active' }, { transaction: t });
      users.push(user);
      await UserRole.create({ userId: user.id, roleId: roleBySlug.get(u.role)!.id }, { transaction: t });
    }
    const userByEmail = new Map(users.map((u) => [u.email as string, u]));

    // Categories
    const categories: Category[] = [];
    for (const name of CATEGORIES) {
      const cat = await Category.create({ name, slug: slugify(name), description: null, status: 'active', parentId: null }, { transaction: t });
      categories.push(cat);
    }
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

    // Tags
    const tags: Tag[] = [];
    for (const name of TAGS) {
      tags.push(await Tag.create({ name, slug: name }, { transaction: t }));
    }
    const tagByName = new Map(tags.map((t) => [t.name, t]));

    // Posts
    for (const p of SAMPLE_POSTS) {
      const authorId = userByEmail.get(p.authorEmail)!.id;
      const categoryId = categoryBySlug.get(p.categorySlug)?.id || null;
      const pubDate = p.publishedAt ? new Date(p.publishedAt) : null;
      const post = await Post.create({
        authorId, categoryId, title: p.title, slug: slugify(p.title),
        excerpt: p.excerpt, content: p.content, featuredImage: null,
        status: p.status, visibility: 'public', publishedAt: pubDate,
        createdAt: pubDate || new Date(), updatedAt: pubDate || new Date(),
      }, { transaction: t });
      if (p.tagNames.length) {
        const postTags = p.tagNames.map((n) => tagByName.get(n)!).filter(Boolean);
        await PostTag.bulkCreate(postTags.map((tg) => ({ postId: post.id, tagId: tg.id })), { transaction: t });
      }
      await PostRevision.create({
        postId: post.id, userId: authorId, title: p.title, excerpt: p.excerpt,
        content: p.content, featuredImage: null, revisionNumber: 1,
        createdAt: pubDate || new Date(),
      }, { transaction: t });
    }

    // Comments
    const postByTitle = new Map((await Post.findAll({ transaction: t })).map((p) => [p.title, p]));
    for (const c of SAMPLE_COMMENTS) {
      const post = postByTitle.get(c.postTitle);
      if (!post) continue;
      const user = userByEmail.get(c.authorEmail);
      if (!user) continue;
      await Comment.create({
        postId: post.id, userId: user.id, parentId: null,
        content: c.content, status: 'approved',
        createdAt: new Date('2026-08-15T10:00:00Z'), updatedAt: new Date('2026-08-15T10:00:00Z'),
      }, { transaction: t });
    }

    // Media
    const mediaItems = [
      { authorEmail: 'alice@example.com', fileName: 'code-on-screen.png', originalName: 'code-on-screen.png', mimeType: 'image/png', altText: 'Code on a screen' },
      { authorEmail: 'alice@example.com', fileName: 'productivity-desk.jpg', originalName: 'productivity-desk.jpg', mimeType: 'image/jpeg', altText: 'A tidy productivity desk' },
      { authorEmail: 'bob@example.com', fileName: 'sourdough-loaf.jpg', originalName: 'sourdough-loaf.jpg', mimeType: 'image/jpeg', altText: 'A freshly baked sourdough loaf' },
      { authorEmail: 'dave@example.com', fileName: 'tropical-beach.jpg', originalName: 'tropical-beach.jpg', mimeType: 'image/jpeg', altText: 'A tropical beach at sunset' },
    ];
    for (const m of mediaItems) {
      const user = userByEmail.get(m.authorEmail);
      if (!user) continue;
      await Media.create({
        userId: user.id, fileName: m.fileName, originalName: m.originalName,
        mimeType: m.mimeType, fileSize: 122880, url: `/uploads/${m.fileName}`,
        altText: m.altText, createdAt: new Date(),
      }, { transaction: t });
    }

    // Settings
    await Setting.bulkCreate(Object.entries(SETTINGS).map(([key, value]) => ({ key, value })), { transaction: t });

    // Notification
    await Notification.create({
      userId: users[0].id, type: 'system', title: 'Welcome to the Blog',
      message: 'Your account has been set up successfully.', data: null, readAt: null,
    }, { transaction: t });

    // Audit log
    await AuditLog.create({
      userId: users[0].id, action: 'system.seed', module: 'system',
      entityType: null, entityId: null, ipAddress: '127.0.0.1',
      userAgent: 'Seeder', oldValues: null, newValues: null,
      createdAt: new Date(),
    }, { transaction: t });

    await t.commit();
    console.log('Database seeded successfully.');
  } catch (e) {
    await t.rollback();
    throw e;
  }
}

