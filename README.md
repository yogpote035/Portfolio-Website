# Yogesh Pote Portfolio

A modern React portfolio with a separate admin dashboard and a backend API service.

## Project structure

```text
portfolio-app/   Public portfolio frontend
admin-app/       Admin dashboard frontend
server/          Express + MySQL backend API
```

## Features

- Portfolio website with project case studies
- Separate admin dashboard for managing content
- JWT-based admin authentication
- Backend API for portfolio and admin data
- Vite frontend builds for both apps

## Run locally

### 1) Backend API

```bash
cd server
npm install
npm run db:schema
npm run db:seed-admin
npm run db:seed-static
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### 2) Portfolio frontend

```bash
cd portfolio-app
npm install
npm run dev
```

The public portfolio usually runs at:

```text
http://localhost:5173
```

### 3) Admin frontend

```bash
cd admin-app
npm install
npm run dev
```

The admin panel usually runs at:

```text
http://localhost:5174
```

## Environment files

The backend uses:

- `server/.env`

Important backend variables:

```text
PORT=5000
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=true
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RESUME_BUCKET=resumes
```

Each frontend app uses its own environment file:

- `portfolio-app/.env`
- `admin-app/.env`

Both currently point to the backend at:

```text
VITE_API_BASE_URL=http://localhost:5000
```

## Build

```bash
cd portfolio-app && npm run build
cd ../admin-app && npm run build
```

## Notes

- The public portfolio app runs from `portfolio-app`.
- The admin panel runs from `admin-app`.
- The API server runs from `server`.
- Public portfolio content is API-driven with local static fallback data.
- Admin-managed portfolio images upload to Cloudinary.
- Resume files upload to Supabase Storage.
- MySQL/TiDB remains the main application database.
