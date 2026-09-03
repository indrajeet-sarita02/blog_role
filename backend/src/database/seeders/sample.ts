import {
  sequelize,
  User,
  Role,
  UserRole,
  Category,
  Tag,
  Post,
  PostTag,
  PostRevision,
  Comment,
  Media,
  Setting,
} from '@database/index';
import { hashPassword } from '@utils/password';
import { slugify } from '@utils/slug';
import { USER_STATUS, POST_STATUS, POST_VISIBILITY, COMMENT_STATUS } from '@config/constants';

const CATEGORIES = [
  { name: 'Technology', description: 'News, tutorials and insights about technology.' },
  { name: 'Lifestyle', description: 'Everyday living, wellness and personal experiences.' },
  { name: 'Travel', description: 'Destinations, guides and travel tips.' },
  { name: 'Food', description: 'Recipes, restaurants and culinary adventures.' },
  { name: 'Business', description: 'Entrepreneurship, startups and market trends.' },
  { name: 'Science', description: 'Discoveries, research and the natural world.' },
];

const TAGS = [
  'javascript',
  'web-development',
  'react',
  'nodejs',
  'productivity',
  'health',
  'budget-travel',
  'recipes',
  'startup',
  'artificial-intelligence',
  'space',
  'mindfulness',
];

const SAMPLE_USERS: Array<{ name: string; email: string; password: string; role: string }> = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123', role: 'author' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123', role: 'editor' },
  { name: 'Carol White', email: 'carol@example.com', password: 'password123', role: 'user' },
  { name: 'Dave Brown', email: 'dave@example.com', password: 'password123', role: 'author' },
];

interface SamplePost {
  title: string;
  authorIndex: number;
  categoryIndex: number;
  excerpt: string;
  content: string;
  tagIndexes: number[];
  status: string;
  publishedAt?: Date;
}

const SAMPLE_POSTS: SamplePost[] = [
  {
    title: 'Getting Started with TypeScript in Node.js',
    authorIndex: 0,
    categoryIndex: 0,
    excerpt: 'A practical introduction to adding type safety to your Node.js applications.',
    content:
      'TypeScript brings static typing to JavaScript, catching errors before you run your code.\n\nIn this post we explore setting up ts-node, configuring tsconfig.json, and sharing types between frontend and backend.\n\nThe biggest win is confidence: refactoring becomes safe and your IDE becomes a powerful ally.',
    tagIndexes: [0, 2, 3],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-01T09:00:00Z'),
  },
  {
    title: 'Building a REST API with Express and Sequelize',
    authorIndex: 1,
    categoryIndex: 0,
    excerpt: 'Learn how to structure a scalable Express API backed by an ORM.',
    content:
      'A well-structured Express application separates concerns into routes, controllers, services and models.\n\nWe walk through authentication with JWT, validating input with Zod, and permission-based access control.\n\nTransactions keep your database consistent even when operations touch multiple tables.',
    tagIndexes: [1, 3],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-05T14:30:00Z'),
  },
  {
    title: '10 Daily Habits to Boost Your Productivity',
    authorIndex: 0,
    categoryIndex: 1,
    excerpt: 'Small, consistent daily habits that compound into big results.',
    content:
      'Productivity is not about doing more, it is about doing the right things.\n\nStart your day by prioritizing three key tasks. Use focused work blocks and eliminate distractions.\n\nRegular reflection helps you double down on what works and drop what does not.',
    tagIndexes: [4, 11],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-10T07:00:00Z'),
  },
  {
    title: 'A Weekend Guide to Budget Travel in Southeast Asia',
    authorIndex: 3,
    categoryIndex: 2,
    excerpt: 'Travel more while spending less with these budget-friendly tips.',
    content:
      'Exploring Southeast Asia does not have to break the bank.\n\nStay in local guesthouses, eat street food, and travel by bus or train instead of flying.\n\nA little planning goes a long way toward an unforgettable yet affordable adventure.',
    tagIndexes: [6],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-14T11:00:00Z'),
  },
  {
    title: 'The Art of Making Perfect Sourdough Bread',
    authorIndex: 1,
    categoryIndex: 3,
    excerpt: 'Master the slow fermentation process behind a crusty, tangy loaf.',
    content:
      'Good sourdough starts with a healthy, active starter.\n\nFermentation develops flavor and structure over time. Patience is your most important ingredient.\n\nWith a few simple techniques you can bake bread that rivals your local bakery.',
    tagIndexes: [7, 11],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-18T16:00:00Z'),
  },
  {
    title: 'Lessons Learned from My First Startup',
    authorIndex: 0,
    categoryIndex: 4,
    excerpt: 'Honest reflections on building a company from zero to launch.',
    content:
      'Founding a startup is equal parts exhilarating and terrifying.\n\nTalk to customers early and often. Ship quickly and iterate based on feedback.\n\nMost importantly, protect your time and energy; resilience is the real currency.',
    tagIndexes: [8],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-22T10:00:00Z'),
  },
  {
    title: 'How Artificial Intelligence Is Changing the Web',
    authorIndex: 1,
    categoryIndex: 0,
    excerpt: 'From chatbots to code generation, AI is reshaping development.',
    content:
      'AI tools are increasingly embedded in the developer workflow.\n\nThey help with boilerplate, testing, and even database query generation.\n\nHuman judgment remains essential, but the craft of software is evolving quickly.',
    tagIndexes: [9, 0],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-25T09:00:00Z'),
  },
  {
    title: 'What We Learned from the Latest Space Missions',
    authorIndex: 3,
    categoryIndex: 5,
    excerpt: 'A roundup of the most exciting discoveries from recent missions.',
    content:
      'Humanity is venturing further into the solar system than ever before.\n\nNew telescopes and probes are revealing the history of our universe in stunning detail.\n\nEach mission answers old questions and raises exciting new ones.',
    tagIndexes: [10],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-28T13:00:00Z'),
  },
  {
    title: 'Introduction to Mindfulness for Busy People',
    authorIndex: 2,
    categoryIndex: 1,
    excerpt: 'Five-minute practices to reduce stress and stay focused.',
    content:
      'Mindfulness does not require an hour of meditation each day.\n\nSimple breathing exercises and short pauses can reset your attention.\n\nIntegrate these micro-practices into your routine for calmer, clearer days.',
    tagIndexes: [11, 4],
    status: POST_STATUS.PUBLISHED,
    publishedAt: new Date('2026-08-30T08:00:00Z'),
  },
];

const SAMPLE_COMMENTS: Array<{ postIndex: number; authorIndex: number; content: string; parentCommentIndex?: number }> = [
  { postIndex: 0, authorIndex: 2, content: 'Great introduction! The setup section saved me a lot of time.' },
  { postIndex: 0, authorIndex: 3, content: 'Would love to see a follow-up on decorators and DI.' },
  { postIndex: 1, authorIndex: 0, content: 'The transaction example was really helpful, thanks!' },
  { postIndex: 2, authorIndex: 2, content: 'Number 3 and 7 made the biggest difference for me.' },
  { postIndex: 2, authorIndex: 2, content: 'How do you handle notifications during focus blocks?', parentCommentIndex: 2 },
  { postIndex: 4, authorIndex: 2, content: 'My starter always fails. Any troubleshooting tips?' },
  { postIndex: 5, authorIndex: 3, content: 'So inspiring. Starting my own company next month!' },
  { postIndex: 6, authorIndex: 0, content: 'AI definitely speeds up my prototyping work.' },
  { postIndex: 7, authorIndex: 2, content: 'The images from the telescope are just breathtaking.' },
  { postIndex: 8, authorIndex: 0, content: 'I use the 5-minute breathing routine daily now.' },
];

const SAMPLE_SETTINGS: Array<{ key: string; value: unknown }> = [
  { key: 'site.title', value: 'My Blog' },
  { key: 'site.tagline', value: 'Thoughts on technology, life and everything in between' },
  { key: 'site.description', value: 'A modern blog built with Next.js, Node.js and SQLite' },
  { key: 'site.posts_per_page', value: 10 },
  { key: 'site.comments_enabled', value: true },
  { key: 'site.content_direction', value: 'ltr' },
  { key: 'site.locale', value: 'en-US' },
  { key: 'site.time_zone', value: 'UTC' },
];

const SAMPLE_MEDIA: Array<{ authorIndex: number; fileName: string; originalName: string; mimeType: string; altText: string }> = [
  { authorIndex: 0, fileName: 'code-on-screen.png', originalName: 'code-on-screen.png', mimeType: 'image/png', altText: 'Code on a screen' },
  { authorIndex: 0, fileName: 'productivity-desk.jpg', originalName: 'productivity-desk.jpg', mimeType: 'image/jpeg', altText: 'A tidy productivity desk' },
  { authorIndex: 1, fileName: 'sourdough-loaf.jpg', originalName: 'sourdough-loaf.jpg', mimeType: 'image/jpeg', altText: 'A freshly baked sourdough loaf' },
  { authorIndex: 3, fileName: 'tropical-beach.jpg', originalName: 'tropical-beach.jpg', mimeType: 'image/jpeg', altText: 'A tropical beach at sunset' },
];

async function run() {
  await sequelize.sync();

  const admin = await User.findOne({ where: { email: process.env.SUPER_ADMIN_EMAIL || 'admin@example.com' } });
  const superAdminId = admin?.id;

  const roleBySlug = new Map<string, Role>();
  for (const role of await Role.findAll()) {
    roleBySlug.set(role.slug, role);
  }

  const users = new Map<string, User>();
  for (const sample of SAMPLE_USERS) {
    const [user] = await User.findOrCreate({
      where: { email: sample.email },
      defaults: {
        name: sample.name,
        email: sample.email,
        passwordHash: await hashPassword(sample.password),
        status: USER_STATUS.ACTIVE,
      },
    });
    users.set(sample.email, user);
    const role = roleBySlug.get(sample.role);
    if (role) {
      await UserRole.findOrCreate({
        where: { userId: user.id, roleId: role.id },
        defaults: { userId: user.id, roleId: role.id },
      });
    }
  }
  console.log(`Seeded ${users.size} sample users`);

  const categories = new Map<string, Category>();
  for (const cat of CATEGORIES) {
    const [category] = await Category.findOrCreate({
      where: { slug: slugify(cat.name) },
      defaults: { name: cat.name, slug: slugify(cat.name), description: cat.description, status: 'active' },
    });
    categories.set(cat.name, category);
  }
  console.log(`Seeded ${categories.size} categories`);

  const tags = new Map<string, Tag>();
  for (const name of TAGS) {
    const [tag] = await Tag.findOrCreate({
      where: { slug: name },
      defaults: { name, slug: name },
    });
    tags.set(name, tag);
  }
  console.log(`Seeded ${tags.size} tags`);

  let postsCreated = 0;
  const userList = [...users.values()];
  const categoryList = [...categories.values()];
  const tagList = [...tags.values()];

  for (const sample of SAMPLE_POSTS) {
    const author = userList[sample.authorIndex];
    const category = categoryList[sample.categoryIndex];
    const existing = await Post.findOne({ where: { slug: slugify(sample.title) } });
    if (existing) {
      postsCreated += 1;
      continue;
    }

    const post = await Post.create({
      authorId: author.id,
      categoryId: category.id,
      title: sample.title,
      slug: slugify(sample.title),
      excerpt: sample.excerpt,
      content: sample.content,
      status: sample.status,
      visibility: POST_VISIBILITY.PUBLIC,
      publishedAt: sample.publishedAt ?? null,
    });

    if (sample.tagIndexes.length > 0) {
      await PostTag.bulkCreate(
        sample.tagIndexes.map((i) => ({ postId: post.id, tagId: tagList[i].id })),
      );
    }

    if (sample.status !== POST_STATUS.DRAFT) {
      await PostRevision.create({
        postId: post.id,
        userId: author.id,
        title: sample.title,
        excerpt: sample.excerpt,
        content: sample.content,
        revisionNumber: 1,
      });
    }

    postsCreated += 1;
  }
  console.log(`Seeded ${postsCreated} posts`);

  let commentsCreated = 0;
  const createdComments: Comment[] = [];
  for (const sample of SAMPLE_COMMENTS) {
    const post = await Post.findAll({ order: [['id', 'ASC']] }).then((p) => p[sample.postIndex]);
    const commenter = userList[sample.authorIndex];
    if (!post) continue;

    let parentId: number | null = null;
    if (sample.parentCommentIndex !== undefined && createdComments[sample.parentCommentIndex]) {
      parentId = createdComments[sample.parentCommentIndex].id;
    }

    const comment = await Comment.create({
      postId: post.id,
      userId: commenter.id,
      parentId,
      content: sample.content,
      status: COMMENT_STATUS.APPROVED,
    });
    createdComments.push(comment);
    commentsCreated += 1;
  }
  console.log(`Seeded ${commentsCreated} comments`);

  let seededMedia = 0;
  for (const media of SAMPLE_MEDIA) {
    const author = userList[media.authorIndex];
    const storagePath = `/uploads/${media.fileName}`;
    const existing = await Media.findOne({ where: { storagePath } });
    if (existing) continue;
    await Media.create({
      userId: author.id,
      fileName: media.fileName,
      originalName: media.originalName,
      mimeType: media.mimeType,
      fileSize: 1024 * 120,
      storagePath,
      url: storagePath,
      altText: media.altText,
    });
    seededMedia += 1;
  }
  console.log(`Seeded ${seededMedia} media files`);

  for (const s of SAMPLE_SETTINGS) {
    await Setting.findOrCreate({
      where: { key: s.key },
      defaults: { key: s.key, value: s.value },
    });
  }
  console.log(`Seeded ${SAMPLE_SETTINGS.length} settings`);

  console.log('Sample data complete');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Sample data seed failed:', err);
    process.exit(1);
  });
