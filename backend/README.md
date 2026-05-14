# MediCore MRMS — Backend API

Express.js modular monolith powering the Medical Record Management System.

---

## Architecture

```
src/
├── common/                 # Shared infrastructure
│   ├── config/             # Environment variables, Pino logger
│   ├── database/           # PostgreSQL pool, auto-migrations, seeds
│   ├── middleware/          # JWT auth, RBAC, Zod validation, error handler
│   ├── errors/             # AppError class with status codes
│   └── utils/              # Async handler, pagination helpers
├── modules/                # Feature modules (vertical slices)
│   ├── auth/               # Login, token verification, current user
│   ├── doctors/            # Doctor CRUD with search & pagination
│   ├── patients/           # Patient CRUD with full profile endpoint
│   └── diagnoses/          # Diagnosis CRUD linked to patients
├── app.js                  # Express application assembly
└── server.js               # Entry point with DB migration
```

## Design Decisions

- **Modular monolith** — organized by domain, easy to extract into microservices later
- **Repository pattern** — data access isolated in service layer
- **Thin controllers** — controllers handle HTTP concerns only; business logic in services
- **Soft deletes** — `deleted_at` column on all entity tables; records are never destroyed
- **UUID primary keys** — prevents ID enumeration, supports distributed deployment
- **Zod validation** — runtime type safety for all API inputs
- **Pino logging** — structured JSON logging with pino-pretty in development

## Setup

```bash
npm install
cp ../.env.example .env   # or set env vars directly
npm run dev               # starts with --watch
npm start                 # production start
npm test                  # run test suite
```

## Environment

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | development | Environment mode |
| `PORT` | No | 5000 | HTTP server port |
| `DB_HOST` | **Yes** | — | PostgreSQL host |
| `DB_PORT` | **Yes** | — | PostgreSQL port |
| `DB_NAME` | **Yes** | — | Database name |
| `DB_USER` | **Yes** | — | Database user |
| `DB_PASSWORD` | **Yes** | — | Database password |
| `JWT_SECRET` | **Yes** | — | HMAC key for token signing |
| `JWT_EXPIRES_IN` | No | 24h | Token expiration duration |
| `CORS_ORIGIN` | No | http://localhost:5173 | Allowed CORS origin |

## Database

Migrations and seeds run automatically on startup.

- **Migration**: `src/common/database/migrations/001_schema.sql`
- **Seed**: `src/common/database/seeds/002_seed.sql`

The migration system tracks executed scripts in a `migrations` table, ensuring idempotent startup.

## Testing

```bash
npm test
```

20 tests across 4 modules using Jest + Supertest with mocked PostgreSQL:

| Module | Tests | Coverage |
|---|---|---|
| Auth | 6 | Login validation, credential verification, token auth, current user |
| Doctors | 6 | Auth guard, paginated list, RBAC enforcement, creation, validation, soft delete |
| Patients | 3 | Paginated list, profile with diagnoses, creation |
| Diagnoses | 5 | Paginated list, RBAC enforcement, validation, soft delete |

## API

Full API documentation is available at `http://localhost:5000/api-docs` when running.

Base URL: `/api/v1`

See root `README.md` for the complete endpoint reference.
