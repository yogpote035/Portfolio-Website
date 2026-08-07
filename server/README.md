# Portfolio CMS API

This folder is the backend foundation for the full-stack Portfolio CMS.

## Current Feature Slice

Implemented:

- Express API bootstrap
- MySQL connection pool
- Security middleware: Helmet, CORS, rate limiter, Morgan
- Admin authentication routes
- JWT access token and refresh token support
- Logout via token version rotation
- Forgot/reset password token flow
- RBAC-ready auth middleware
- Zod request validation
- Normalized MySQL schema for the CMS modules
- Super admin seed script

## Setup

1. Create a local environment file:

```bash
copy .env.example .env
```

2. Update database and JWT values in `.env`.

3. Create the MySQL database and tables:

```bash
mysql -u root -p < database/schema.sql
```

4. Install dependencies:

```bash
npm install
```

5. Seed the first super admin:

```bash
npm run db:seed-admin
```

6. Run the API:

```bash
npm run dev
```

## Auth Endpoints

- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Health Check

- `GET /api/health`

## Next Feature Slice

Recommended next step: Admin frontend authentication with login/logout,
protected routes, Axios API client, auth state, loading states, and toast
notifications.
