# Blog Application

Full-stack blog / CMS with a **FastAPI (Python)** backend and a **Next.js (React/TypeScript)** frontend.

## Tech Stack

### Backend (`backend/`)

- FastAPI (Python 3)
- SQLAlchemy ORM
- SQLite (development) / MySQL (production)
- Pydantic validation
- JWT authentication (PyJWT)
- bcrypt password hashing
- Uvicorn ASGI server

### Frontend (`frontend/`)

- Next.js 13 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- TanStack React Query

## Features

- Role-based access control (RBAC) with granular permissions (`[module].[action]`)
- Post workflow: draft → pending review → approved → published → archived/rejected
- Post revisions with restore
- Comments with nested replies and moderation
- Media upload management
- Categories, tags, search, and public blog pages
- Notifications, audit logs, and site settings
- Admin and dashboard panels

## Project Structure

```text
blog/
├── blog_application_backend_frontend.md   # Technical specification
├── backend/                                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes (auth, users, posts, ...)
│   │   ├── core/           # Security, errors, rate limiting, ...
│   │   ├── services/       # Business logic
│   │   ├── main.py         # FastAPI app factory
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── seed.py         # Seed script
│   │   └── ...
│   ├── .env.example
│   ├── requirements.txt
│   └── database.sqlite     # SQLite database (dev)
└── frontend/                               # Next.js frontend
    ├── src/
    │   ├── app/            # Pages (public, auth, dashboard, admin)
    │   ├── components/     # UI and feature components
    │   ├── lib/            # API client, auth, utils
    │   ├── hooks/
    │   └── types/
    ├── .env.example
    └── package.json
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm

## Setup

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# edit .env (JWT secrets, super admin credentials, etc.)

# Seed the database (roles, permissions, super admin)
python app/seed.py

# Start the API server on port 5000
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

Interactive API docs are available at:

- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Start the dev server on port 3000
npm run dev
```

Open http://localhost:3000

## Default Super Admin

| Email | Password |
|---|---|
| admin@example.com | admin123 |

Change these credentials in `backend/.env` before deploying.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | API port | `5000` |
| `DB_STORAGE` | SQLite file path | `./database.sqlite` |
| `JWT_ACCESS_SECRET` | Access token signing secret | – |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | – |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `SUPER_ADMIN_EMAIL` | Seeded super admin email | – |
| `SUPER_ADMIN_PASSWORD` | Seeded super admin password | – |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `UPLOAD_DIR` | Media upload directory | `uploads` |
| `MAX_UPLOAD_SIZE_MB` | Max upload size in MB | `10` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

## API

All endpoints are under `/api/v1`. Modules: auth, users, roles, permissions, categories, tags, posts, comments, public, media, notifications, audit, settings.

Responses follow a consistent shape:

```json
{ "success": true, "message": "...", "data": {}, "meta": {} }
```

Errors:

```json
{ "success": false, "message": "...", "error": { "code": "...", "details": null } }
```

## Scripts

| Task | Backend | Frontend |
|---|---|---|
| Run dev server | `uvicorn app.main:app --port 5000 --reload` | `npm run dev` |
| Seed database | `python app/seed.py` | – |
| Type check | – | `npm run typecheck` |
| Lint | – | `npm run lint` |
| Build | – | `npm run build` |