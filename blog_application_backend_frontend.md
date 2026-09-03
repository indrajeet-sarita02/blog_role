# Blog Application — Backend & Frontend Technical Specification

## 1. Document Purpose

This document defines the technical architecture, database design, backend API structure, frontend architecture, authorization model, workflows, and development standards for a production-ready Blog Application.

The application supports multiple user types with configurable roles and permissions. Users may create, edit, publish, review, comment on, moderate, and manage blog content according to their permissions.

---

# 2. Project Goals

## Primary Goals

- Build a scalable Blog/CMS application.
- Support multiple user roles.
- Support granular permissions.
- Separate authentication from authorization.
- Support ownership-based access control.
- Support blog drafting, review, approval, publishing, and archiving.
- Support comments and nested replies.
- Provide an administration panel.
- Maintain audit history for important operations.
- Keep backend and frontend independently maintainable.
- Use a clean architecture that can grow without major rewrites.

## Recommended Technology Stack

### Backend

- Node.js
- TypeScript
- Express.js
- MySQL
- Sequelize ORM
- JWT authentication
- bcrypt/bcryptjs for password hashing
- Zod or Joi for validation
- Helmet
- CORS
- Morgan/Pino/Winston for logging

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- Axios or fetch
- Rich text editor

### Optional Infrastructure

- Redis for caching/rate limiting
- S3-compatible storage or Cloudinary for media
- BullMQ for background jobs
- Docker for development/deployment

---

# 3. System Architecture

```text
                         ┌──────────────────────┐
                         │      End Users       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js         │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │ HTTPS
                                    ▼
                         ┌──────────────────────┐
                         │      Express API     │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
               ┌────────────────────┼────────────────────┐
               ▼                    ▼                    ▼
        ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
        │   Auth &    │      │    Blog     │      │  Comment    │
        │Authorization│      │   Modules   │      │   Module    │
        └─────────────┘      └─────────────┘      └─────────────┘
               │                    │                    │
               └────────────────────┼────────────────────┘
                                    ▼
                              ┌─────────────┐
                              │   MySQL     │
                              │  Database   │
                              └─────────────┘
```

---

# 4. User Types

The initial system should support the following roles.

| Role | Description |
|---|---|
| Super Admin | Complete system access |
| Admin | Administrative and content management access |
| Editor | Can manage and approve content |
| Author | Can create and manage own posts |
| Contributor | Can create posts and submit them for review |
| Registered User | Can read, comment, reply, and manage own comments |
| Guest | Can read publicly available content |

Roles must not be hard-coded into application business logic. Permissions should determine access.

---

# 5. Authorization Model

The application will use RBAC (Role-Based Access Control).

```text
User
  │
  ├── User Role
  │       │
  │       ▼
  │      Role
  │       │
  │       ▼
  │  Permissions
  │
  └── Ownership Rules
```

Authorization has two layers:

1. Permission check
2. Resource ownership check

Example:

```text
Author wants to edit Post #100

blog.update permission = YES
post.author_id = current_user.id

Result = ALLOW
```

If the post belongs to another author:

```text
blog.update permission = YES
post.author_id != current_user.id
blog.updateAny permission = NO

Result = DENY
```

An Editor with `blog.updateAny` can edit the post.

---

# 6. Permission Naming Convention

Permissions should follow:

```text
[module].[action]
```

Examples:

```text
blog.create
blog.view
blog.viewAny
blog.update
blog.updateAny
blog.delete
blog.deleteAny
blog.publish
blog.approve
blog.reject
blog.archive

comment.create
comment.view
comment.update
comment.updateAny
comment.delete
comment.deleteAny
comment.approve
comment.reject

user.create
user.view
user.update
user.delete
user.activate
user.deactivate

role.create
role.view
role.update
role.delete

permission.view
role.assignPermission

category.create
category.view
category.update
category.delete

tag.create
tag.view
tag.update
tag.delete

media.upload
media.view
media.delete

audit.view
settings.view
settings.update
```

---

# 7. Role Permission Matrix

| Permission | Super Admin | Admin | Editor | Author | Contributor | User |
|---|---:|---:|---:|---:|---:|---:|
| blog.create | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| blog.view | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| blog.update | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| blog.updateAny | ✓ | ✓ | ✓ | - | - | - |
| blog.delete | ✓ | ✓ | ✓ | ✓ | - | - |
| blog.deleteAny | ✓ | ✓ | ✓ | - | - | - |
| blog.publish | ✓ | ✓ | ✓ | ✓* | - | - |
| blog.approve | ✓ | ✓ | ✓ | - | - | - |
| comment.create | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| comment.update | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| comment.updateAny | ✓ | ✓ | ✓ | - | - | - |
| comment.delete | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| comment.deleteAny | ✓ | ✓ | ✓ | - | - | - |
| category.manage | ✓ | ✓ | ✓ | - | - | - |
| tag.manage | ✓ | ✓ | ✓ | - | - | - |
| user.manage | ✓ | ✓ | - | - | - | - |
| role.manage | ✓ | ✓* | - | - | - | - |
| audit.view | ✓ | ✓ | - | - | - | - |

`*` Business rules may further restrict these actions.

---

# 8. Backend Modules

```text
Authentication
Authorization
Users
Roles
Permissions
Posts
Categories
Tags
Comments
Media
Search
Notifications
Audit Logs
Settings
```

---

# 9. Backend Project Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── database/
│   │   ├── models/
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── posts/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── comments/
│   │   ├── media/
│   │   ├── notifications/
│   │   └── audit/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── ownership.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── slug.ts
│   │   ├── pagination.ts
│   │   └── response.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

---

# 10. Database Design

Database: **MySQL 8+**

Character set:

```sql
utf8mb4
```

Recommended storage engine:

```text
InnoDB
```

---

# 11. Core Tables

## 11.1 users

```text
id
name
email
password_hash
avatar
bio
status
email_verified_at
last_login_at
created_at
updated_at
deleted_at
```

Rules:

- `email` must be unique.
- Password must never be stored in plain text.
- Use soft delete where appropriate.
- `status` can be active, inactive, suspended, pending.

---

## 11.2 roles

```text
id
name
slug
description
is_system
created_at
updated_at
```

Examples:

```text
super-admin
admin
editor
author
contributor
user
```

`is_system` prevents accidental deletion of critical built-in roles.

---

## 11.3 permissions

```text
id
name
slug
module
description
created_at
updated_at
```

Example:

```text
id: 1
name: Create Blog
slug: blog.create
module: blog
```

---

## 11.4 user_roles

Many-to-many relationship:

```text
id
user_id
role_id
created_at
```

Unique constraint:

```text
(user_id, role_id)
```

---

## 11.5 role_permissions

Many-to-many relationship:

```text
id
role_id
permission_id
created_at
```

Unique constraint:

```text
(role_id, permission_id)
```

---

# 12. Blog Tables

## 12.1 posts

```text
id
author_id
category_id
title
slug
excerpt
content
featured_image
status
visibility
published_at
created_at
updated_at
deleted_at
```

### Status

```text
draft
pending_review
approved
published
rejected
archived
```

### Visibility

```text
public
private
```

---

# 13. Post Workflow

```text
                 ┌─────────┐
                 │  Draft  │
                 └────┬────┘
                      │
                      ▼
              ┌───────────────┐
              │Pending Review │
              └───────┬───────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
        ┌──────────┐      ┌──────────┐
        │ Approved │      │ Rejected │
        └────┬─────┘      └────┬─────┘
             │                 │
             ▼                 │
        ┌───────────┐           │
        │ Published │           │
        └─────┬─────┘           │
              │                 │
              ▼                 │
        ┌───────────┐           │
        │ Archived  │◄──────────┘
        └───────────┘
```

A Contributor cannot publish directly.

An Author may publish directly if the business rule grants `blog.publish`.

An Editor/Admin can approve and publish according to permissions.

---

# 14. Post Revisions

Create:

```text
post_revisions
```

Fields:

```text
id
post_id
user_id
title
excerpt
content
featured_image
revision_number
created_at
```

Purpose:

- Track content changes.
- Recover previous versions.
- Support editorial review.
- Maintain auditability.

---

# 15. Categories

```text
categories
├── id
├── parent_id
├── name
├── slug
├── description
├── status
├── created_at
└── updated_at
```

`parent_id` supports nested categories.

Example:

```text
Technology
├── Programming
│   ├── JavaScript
│   ├── Python
│   └── PHP
└── Artificial Intelligence
```

---

# 16. Tags

```text
tags
├── id
├── name
├── slug
├── created_at
└── updated_at
```

Many-to-many relationship:

```text
post_tags
├── post_id
└── tag_id
```

---

# 17. Comments

```text
comments
├── id
├── post_id
├── user_id
├── parent_id
├── content
├── status
├── created_at
├── updated_at
└── deleted_at
```

`parent_id` allows nested replies.

Example:

```text
Comment
  └── Reply
       └── Reply
```

---

# 18. Comment Workflow

Recommended status values:

```text
pending
approved
rejected
spam
deleted
```

Possible workflow:

```text
User submits comment
        ↓
     Pending
        ↓
   Moderation
    /      \
Approved  Rejected
   ↓
Visible
```

The system can later support automatic moderation or immediate publishing.

---

# 19. Media

```text
media
├── id
├── user_id
├── file_name
├── original_name
├── mime_type
├── file_size
├── storage_path
├── url
├── alt_text
├── created_at
└── deleted_at
```

Recommended practice:

- Store files outside the MySQL database.
- Store metadata and file location in MySQL.
- Validate MIME type and file extension.
- Restrict upload size.
- Generate unique storage names.

---

# 20. Audit Logs

```text
audit_logs
├── id
├── user_id
├── action
├── module
├── entity_type
├── entity_id
├── old_values
├── new_values
├── ip_address
├── user_agent
└── created_at
```

Examples:

```text
POST_CREATED
POST_UPDATED
POST_PUBLISHED
POST_DELETED
COMMENT_DELETED
USER_CREATED
ROLE_UPDATED
PERMISSION_ASSIGNED
```

Audit logs should be append-only for normal application users.

---

# 21. Notifications

Optional but recommended:

```text
notifications
├── id
├── user_id
├── type
├── title
├── message
├── data
├── read_at
├── created_at
└── updated_at
```

Examples:

```text
Post approved
Post rejected
Comment received
Comment approved
Mention received
```

---

# 22. Database Relationships

```text
users
  │
  ├──────────────< user_roles >────────────── roles
  │                                             │
  │                                             │
  │                                  role_permissions
  │                                             │
  │                                             ▼
  │                                       permissions
  │
  ├──────────────< posts
  │                    │
  │                    ├────────── categories
  │                    │
  │                    ├──────────< post_tags >──────── tags
  │                    │
  │                    ├──────────< post_revisions
  │                    │
  │                    └──────────< comments
  │                                      │
  │                                      └── parent_id
  │
  ├──────────────< media
  │
  ├──────────────< notifications
  │
  └──────────────< audit_logs
```

---

# 23. Indexing Strategy

Important indexes:

```text
users.email UNIQUE
users.status
roles.slug UNIQUE
permissions.slug UNIQUE

posts.slug UNIQUE
posts.author_id
posts.category_id
posts.status
posts.published_at
posts.created_at

comments.post_id
comments.user_id
comments.parent_id
comments.status

categories.slug UNIQUE
categories.parent_id

tags.slug UNIQUE

post_tags(post_id, tag_id)
user_roles(user_id, role_id)
role_permissions(role_id, permission_id)
```

For public blog listing, a composite index can be considered:

```text
(status, published_at)
```

Actual indexes should be validated using production query patterns and `EXPLAIN`.

---

# 24. API Standards

Base URL:

```text
/api/v1
```

Use versioning from the beginning.

---

# 25. Authentication APIs

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
```

---

# 26. User APIs

```http
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

PATCH  /api/v1/users/:id/status
PUT    /api/v1/users/:id/roles
```

---

# 27. Role APIs

```http
GET    /api/v1/roles
GET    /api/v1/roles/:id
POST   /api/v1/roles
PUT    /api/v1/roles/:id
DELETE /api/v1/roles/:id

GET    /api/v1/roles/:id/permissions
PUT    /api/v1/roles/:id/permissions
```

---

# 28. Permission APIs

```http
GET /api/v1/permissions
GET /api/v1/permissions/:id
```

Permissions are generally managed by system administrators rather than normal users.

---

# 29. Post APIs

```http
GET    /api/v1/posts
GET    /api/v1/posts/:id
POST   /api/v1/posts
PUT    /api/v1/posts/:id
DELETE /api/v1/posts/:id

POST   /api/v1/posts/:id/submit-review
POST   /api/v1/posts/:id/approve
POST   /api/v1/posts/:id/reject
POST   /api/v1/posts/:id/publish
POST   /api/v1/posts/:id/archive

GET    /api/v1/posts/:id/revisions
GET    /api/v1/posts/:id/revisions/:revisionId
POST   /api/v1/posts/:id/revisions/:revisionId/restore
```

---

# 30. Public Blog APIs

Public endpoints should only expose published/public content.

```http
GET /api/v1/public/posts
GET /api/v1/public/posts/:slug
GET /api/v1/public/categories
GET /api/v1/public/categories/:slug
GET /api/v1/public/tags
GET /api/v1/public/tags/:slug
GET /api/v1/public/search
```

Never rely only on frontend filtering to hide drafts.

The backend must enforce:

```text
status = published
visibility = public
```

for public endpoints.

---

# 31. Comment APIs

```http
GET    /api/v1/posts/:postId/comments
POST   /api/v1/posts/:postId/comments

GET    /api/v1/comments/:id
PUT    /api/v1/comments/:id
DELETE /api/v1/comments/:id

POST   /api/v1/comments/:id/approve
POST   /api/v1/comments/:id/reject
```

---

# 32. Category APIs

```http
GET    /api/v1/categories
GET    /api/v1/categories/:id
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

---

# 33. Tag APIs

```http
GET    /api/v1/tags
GET    /api/v1/tags/:id
POST   /api/v1/tags
PUT    /api/v1/tags/:id
DELETE /api/v1/tags/:id
```

---

# 34. Standard API Response

Success:

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 101
  }
}
```

List:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Error:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

---

# 35. HTTP Status Codes

Use standard status codes:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

---

# 36. Authentication Architecture

Recommended approach:

```text
Access Token
+
Refresh Token
```

Access token:

- Short-lived.
- Used for API authorization.

Refresh token:

- Longer-lived.
- Used to obtain a new access token.
- Should be revocable.

Never store passwords in JWT.

JWT payload should contain minimal identity information, for example:

```json
{
  "sub": "123",
  "type": "access",
  "iat": 0,
  "exp": 0
}
```

Permissions should preferably be resolved server-side rather than trusting a client-provided permission list.

---

# 37. Backend Middleware Flow

```text
Request
  ↓
CORS
  ↓
Security Headers
  ↓
Request Logging
  ↓
Rate Limiting
  ↓
Authentication
  ↓
Permission Check
  ↓
Ownership Check
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Repository/ORM
  ↓
Database
```

Business rules belong primarily in services, not controllers.

---

# 38. Controller / Service Responsibility

Bad:

```text
Controller:
- Validate everything
- Query database
- Apply business rules
- Update database
- Send response
```

Better:

```text
Controller
   ↓
Validation
   ↓
Service
   ↓
Model/Repository
   ↓
Database
```

Controller should remain thin.

Example:

```text
post.controller.ts
    ↓
post.service.ts
    ↓
Post model
```

---

# 39. Frontend Architecture

Recommended Next.js structure:

```text
frontend/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── blog/
│   │   ├── category/
│   │   ├── tag/
│   │   └── search/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── dashboard/
│       ├── page.tsx
│       ├── posts/
│       ├── comments/
│       ├── media/
│       ├── profile/
│       │
│       └── admin/
│           ├── users/
│           ├── roles/
│           ├── permissions/
│           ├── categories/
│           ├── tags/
│           ├── comments/
│           ├── audit-logs/
│           └── settings/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── blog/
│   ├── comments/
│   ├── forms/
│   ├── tables/
│   └── editor/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── permissions/
│   └── utils/
│
├── hooks/
├── types/
└── middleware.ts
```

---

# 40. Frontend Permission Handling

The frontend may hide UI elements based on permissions:

```text
User has blog.create
    ↓
Show "Create Post"

User does not have blog.create
    ↓
Hide "Create Post"
```

However:

> Frontend permission checks are for UX only.

The backend must always enforce permissions.

Never assume that hiding a button provides security.

---

# 41. Dashboard

Dashboard should be role-aware.

## Author Dashboard

```text
My Posts
Drafts
Pending Review
Published
Comments
Create Post
```

## Editor Dashboard

```text
Total Posts
Pending Reviews
Published Posts
Rejected Posts
Comments
Moderation Queue
```

## Admin Dashboard

```text
Users
Roles
Posts
Comments
Categories
Tags
Reports
Audit Logs
System Statistics
```

---

# 42. Post Editor

The post editor should support:

- Title
- Slug
- Excerpt
- Rich content
- Featured image
- Category
- Tags
- Status
- Visibility
- SEO title
- SEO description
- Preview
- Save Draft
- Submit for Review
- Publish
- Schedule (optional)

---

# 43. Blog Listing

Admin/user listing should support:

- Pagination
- Search
- Sort
- Status filter
- Category filter
- Author filter
- Date range
- Bulk actions where authorized

Example:

```text
Search: "Node.js"

Status: Published

Category: Programming

Author: John

Sort: Newest
```

---

# 44. Public Blog Page

Recommended structure:

```text
Header
  ↓
Breadcrumb
  ↓
Title
  ↓
Author + Published Date
  ↓
Featured Image
  ↓
Article Content
  ↓
Tags
  ↓
Like/Share
  ↓
Comments
  ↓
Related Posts
```

---

# 45. SEO Requirements

Each public post should support:

```text
SEO title
SEO description
Canonical URL
Slug
Open Graph title
Open Graph description
Open Graph image
```

Next.js metadata APIs should be used for server-rendered public pages.

---

# 46. Search

Initial search can use MySQL indexes and `LIKE`/full-text search depending on scale.

For a larger system, consider:

```text
OpenSearch
Elasticsearch
Meilisearch
```

Do not introduce a dedicated search engine until MySQL search becomes a real bottleneck.

---

# 47. Pagination

Use server-side pagination.

Recommended query parameters:

```text
?page=1
&limit=20
&search=node
&sort=created_at
&order=desc
```

Maximum `limit` must be enforced by backend.

Example:

```text
Requested limit = 10000
Allowed maximum = 100

Result:
limit = 100
```

---

# 48. Security Requirements

The backend must implement:

- Password hashing
- Input validation
- SQL injection protection through Sequelize parameterization
- XSS protection
- CSRF strategy where applicable
- CORS restrictions
- Rate limiting
- Helmet/security headers
- Secure cookies if cookies are used
- JWT expiration
- Refresh-token revocation
- File upload validation
- Authorization on every protected endpoint
- Ownership checks
- Audit logging for sensitive operations
- Generic authentication error messages
- Secrets stored in environment variables

---

# 49. Rich Text / HTML Security

Rich text content must not be blindly rendered.

User-generated HTML should be sanitized before storage and/or rendering.

Never assume:

```text
HTML from user = trusted
```

The frontend must also avoid unsafe HTML rendering unless the content has been properly sanitized.

---

# 50. Soft Delete

Use soft deletion for entities where recovery/audit is valuable.

Example:

```text
deleted_at = NULL
```

Active record:

```text
deleted_at IS NULL
```

Deleted record:

```text
deleted_at IS NOT NULL
```

Do not automatically soft-delete every table. Apply it according to business requirements.

---

# 51. Transactions

Use database transactions for multi-step operations.

Example:

```text
Create Post
   ↓
Create Post Tags
   ↓
Create Revision
   ↓
Create Audit Log
```

These operations should be wrapped in a transaction when consistency between them is required.

If one critical operation fails:

```text
ROLLBACK
```

---

# 52. Concurrency Considerations

For editorial systems, consider concurrent editing.

Possible strategies:

- Optimistic locking
- Version number
- `updated_at` comparison

Example:

```text
User A loads Post version 5

User B updates Post
Version becomes 6

User A submits changes based on version 5

Backend detects conflict
→ Return 409 Conflict
```

This prevents silent overwrites.

---

# 53. Logging

Application logs should contain:

```text
timestamp
level
request_id
user_id (when available)
method
path
status
duration
error code
```

Never log:

```text
password
access token
refresh token
sensitive secrets
```

---

# 54. Environment Variables

Example `.env.example`:

```env
NODE_ENV=development

PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=blog_db
DB_USER=root
DB_PASSWORD=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

Never commit the real `.env` file.

---

# 55. Database Migration Strategy

Use Sequelize migrations.

Do not depend on:

```text
sequelize.sync({ alter: true })
```

for production schema management.

Recommended:

```text
migration
    ↓
review
    ↓
test
    ↓
deploy
```

Every schema change should have a migration.

---

# 56. Seed Data

Create seeders for:

## System Roles

```text
Super Admin
Admin
Editor
Author
Contributor
User
```

## Default Permissions

Seed all initial permissions.

## Initial Super Admin

Create through a secure deployment/setup process rather than hard-coding credentials in source code.

---

# 57. Testing Strategy

## Unit Tests

Test:

- Services
- Permission logic
- Ownership rules
- Validators
- Utility functions

## Integration Tests

Test:

- Authentication
- Posts
- Comments
- Role assignment
- Permission enforcement

## API Tests

Test:

```text
200
201
400
401
403
404
409
422
```

Especially test unauthorized access.

---

# 58. Critical Authorization Test Cases

### Test 1

Author edits own post:

```text
Expected: 200
```

### Test 2

Author edits another author's post:

```text
Expected: 403
```

### Test 3

Editor edits another author's post:

```text
Expected: 200
```

### Test 4

Guest creates comment:

```text
Expected: 401
```

if authentication is required.

### Test 5

User edits another user's comment:

```text
Expected: 403
```

### Test 6

Admin approves post:

```text
Expected: 200
```

### Test 7

Contributor tries to publish:

```text
Expected: 403
```

---

# 59. Development Phases

## Phase 1 — Foundation

- Repository setup
- TypeScript
- Express
- MySQL
- Sequelize
- Environment configuration
- Error handling
- Logging

## Phase 2 — Authentication

- Registration
- Login
- Logout
- Access token
- Refresh token
- Password reset
- Current user

## Phase 3 — Authorization

- Roles
- Permissions
- User-role assignment
- Role-permission assignment
- Permission middleware
- Ownership middleware

## Phase 4 — Blog

- Categories
- Tags
- Posts
- Drafts
- Publishing
- Approval workflow
- Revisions

## Phase 5 — Comments

- Comments
- Replies
- Moderation
- Ownership

## Phase 6 — Media

- Upload
- Media library
- Featured image

## Phase 7 — Admin Panel

- Dashboard
- Users
- Roles
- Permissions
- Posts
- Comments
- Categories
- Tags
- Audit logs

## Phase 8 — Public Website

- Homepage
- Blog listing
- Blog details
- Categories
- Tags
- Search
- Comments

## Phase 9 — Quality

- Unit tests
- Integration tests
- Security testing
- Performance testing
- Error monitoring

## Phase 10 — Deployment

- Docker
- Production database
- Environment variables
- CI/CD
- Backups
- Monitoring

---

# 60. Recommended Implementation Order

The actual coding order should be:

```text
1. Database schema
        ↓
2. Sequelize models
        ↓
3. Migrations
        ↓
4. Seeders
        ↓
5. Authentication
        ↓
6. RBAC
        ↓
7. User management
        ↓
8. Categories & Tags
        ↓
9. Posts
        ↓
10. Post workflow
        ↓
11. Comments
        ↓
12. Media
        ↓
13. Audit logs
        ↓
14. API testing
        ↓
15. Next.js foundation
        ↓
16. Authentication UI
        ↓
17. Dashboard
        ↓
18. Post management UI
        ↓
19. Comment management UI
        ↓
20. Public blog
        ↓
21. SEO
        ↓
22. Testing
        ↓
23. Deployment
```

---

# 61. Definition of Done

A feature is not complete merely because the UI works.

For every feature:

```text
Database
   ✓
Migration
   ✓
Model
   ✓
Validation
   ✓
Service
   ✓
Controller
   ✓
Route
   ✓
Authorization
   ✓
Error handling
   ✓
Audit where required
   ✓
Unit tests
   ✓
Integration tests
   ✓
Frontend UI
   ✓
Loading state
   ✓
Error state
   ✓
Empty state
   ✓
Permission-based UI
   ✓
```

---

# 62. Architecture Principles

The project should follow these principles:

1. Backend is the source of truth for authorization.
2. Controllers remain thin.
3. Business logic belongs in services.
4. Database changes are managed through migrations.
5. Roles are collections of permissions.
6. Ownership is separate from permissions.
7. Public APIs expose only published/public content.
8. Sensitive operations are audited.
9. Frontend permission checks improve UX but never provide security.
10. Every protected API endpoint must independently enforce authorization.
11. Avoid premature infrastructure complexity.
12. Design database relationships explicitly before implementing CRUD.
13. Prefer predictable REST APIs and consistent response formats.
14. Validate input at API boundaries.
15. Keep public and administrative concerns clearly separated.

---

# 63. Future Features

The architecture should leave room for:

- Scheduled publishing
- Post likes/reactions
- Bookmarks
- User following
- Author profiles
- Email notifications
- Push notifications
- Newsletter
- Social sharing
- Advanced analytics
- SEO sitemap
- RSS feed
- Multi-language posts
- Draft collaboration
- Content moderation
- AI-assisted content tools
- Search engine integration
- CDN
- Redis caching
- Multi-tenant blogs

These should be added only when business requirements justify them.

---

# 64. Final Architecture Summary

```text
                    BLOG APPLICATION
                           │
            ┌──────────────┴──────────────┐
            │                             │
       PUBLIC WEBSITE                ADMIN/DASHBOARD
            │                             │
            └──────────────┬──────────────┘
                           │
                       NEXT.JS
                           │
                         HTTPS
                           │
                    EXPRESS + TS
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       AUTH/RBAC          BLOG          COMMENTS
          │                │                │
          ├──────────── USERS ──────────────┤
          │                │                │
          └────────────────┼────────────────┘
                           │
                      SEQUELIZE
                           │
                         MYSQL
                           │
                 ┌─────────┴─────────┐
                 │                   │
              AUDIT              MEDIA
```

This specification is intended to be the baseline technical document for implementation. Before production coding begins, the exact business rules, permission matrix, database ERD, API contracts, and UI wireframes should be reviewed and approved.
