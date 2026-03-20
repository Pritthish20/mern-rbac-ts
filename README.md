# Scalable MERN REST API With Auth, RBAC, and Task Management

This project is a fresh TypeScript MERN application built as a clean assignment-ready starter. It includes:

- JWT-based authentication with hashed passwords
- Role-based access control for `user` and `admin`
- Versioned REST APIs under `/api/v1`
- CRUD for a secondary entity: `tasks`
- MongoDB schema with Mongoose
- Validation, centralized error handling, and basic sanitization
- Swagger API documentation
- React + TypeScript frontend for registration, login, and task management

## Project Structure

```text
mern-rbac-ts/
  backend/
  frontend/
```

## Backend Setup

1. Go to `backend`
2. Copy `.env.example` to `.env`
3. Install dependencies with `npm install`
4. Start the API with `npm run dev`

Example backend env:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mern_rbac_ts
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
API_BASE_URL=http://localhost:5000
ADMIN_INVITE_CODE=make-admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
SEED_ADMIN_NAME=System Admin
```

Swagger docs are served at:

```text
http://localhost:5000/api-docs
```

## Frontend Setup

1. Go to `frontend`
2. Copy `.env.example` to `.env`
3. Install dependencies with `npm install`
4. Start the app with `npm run dev`

Example frontend env:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Vercel Deployment

Deploy the frontend and backend as two separate Vercel projects.

Backend project root:

```text
mern-rbac-ts/backend
```

Backend env vars:

```env
NODE_ENV=production
MONGODB_URI=your-atlas-uri
JWT_SECRET=your-production-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
API_BASE_URL=https://your-backend-domain.vercel.app
ADMIN_INVITE_CODE=your-admin-code
```

Notes:

- Vercel can deploy the Express app directly from [backend\src\app.ts](d:\Projects\Revs\mern-rbac-ts\backend\src\app.ts) with zero custom routing config
- MongoDB connection reuse is enabled in [backend\src\config\db.ts](d:\Projects\Revs\mern-rbac-ts\backend\src\config\db.ts) for serverless deployments

Frontend project root:

```text
mern-rbac-ts/frontend
```

Frontend env vars:

```env
VITE_API_URL=https://your-backend-domain.vercel.app/api/v1
```

Notes:

- [frontend\vercel.json](d:\Projects\Revs\mern-rbac-ts\frontend\vercel.json) rewrites all routes to `index.html`
- Set backend `CLIENT_ORIGIN` to your deployed frontend URL so CORS allows requests

## Default Flow

- Register a normal user from the frontend
- Register an admin by choosing the `admin` role and providing the `ADMIN_INVITE_CODE`
- Login to receive a JWT
- Use the dashboard to create, edit, delete, and filter tasks
- Admins can view all tasks and assign tasks to any user
- Regular users can only view and manage their own tasks

## API Overview

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/auth/users` (`admin` only)
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

## Scalability Note

The current structure is modular enough to grow into a larger service:

- Route, controller, validation, model, and middleware layers are already separated
- API versioning allows non-breaking evolution
- JWT auth is stateless and works well behind load balancers
- MongoDB models can be split into modules or separate services later
- Logging and Swagger docs make the app easier to operate and extend

If this grows further, the next practical additions would be Redis caching for hot reads, a background worker for notifications or audits, and containerized deployment with separate API, frontend, and database services.
