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
│   ├── patients/           # Patient CRUD with full profile; initial diagnosis on create
│   ├── diseases/           # Centralized disease registry (admin-managed)
│   ├── disease-categories/ # Disease taxonomy CRUD
│   ├── disease-suggestions/# Doctor suggestion workflow with admin review
│   ├── medical-records/    # Patient-disease associations
│   ├── appointments/       # Appointment scheduling with status tracking
│   ├── receptionists/      # Receptionist profile management
│   ├── diagnoses/          # Legacy diagnosis module
│   └── audit-logs/         # System audit trail
├── app.js                  # Express application assembly
└── server.js               # Entry point with DB migration
```

## Design Decisions

- **Modular monolith** — organized by domain, easy to extract into microservices later
- **Repository pattern** — data access isolated in service layer
- **Thin controllers** — controllers handle HTTP concerns only; business logic in services
- **Soft deletes** — `deleted_at` column on entity tables; `is_active` flag on disease/category tables; records are never destroyed
- **UUID primary keys** — prevents ID enumeration, supports distributed deployment
- **Zod validation** — runtime type safety for all API inputs
- **Pino logging** — structured JSON logging with pino-pretty in development
- **Transactional reviews** — disease suggestion approval uses database transactions; patient creation with initial diagnosis is atomic

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

- **Migrations**: `src/common/database/migrations/001_schema.sql`, `003_refactor_roles_and_tables.sql`, `005_add_suggestion_severity.sql`
- **Seeds**: `src/common/database/seeds/002_seed.sql`, `004_seed_refactor.sql`

The migration system tracks executed scripts in a `migrations` table, ensuring idempotent startup. Key database objects:

| Type | Name | Description |
|---|---|---|
| Table | `users` | Authentication and role assignment |
| Table | `doctors` | Doctor profiles (linked to users) |
| Table | `patients` | Patient demographics |
| Table | `diseases` | Centralized disease registry |
| Table | `disease_categories` | Disease taxonomy |
| Table | `disease_suggestions` | Doctor-submitted suggestions with review workflow |
| Table | `medical_records` | Patient-disease associations |
| Table | `appointments` | Scheduled visits |
| Table | `receptionists` | Receptionist profiles |
| Table | `audit_logs` | System change tracking |
| Enum | `user_role` | `admin`, `doctor`, `receptionist` |
| Enum | `diagnosis_severity` | `mild`, `moderate`, `severe`, `critical` |
| Enum | `suggestion_status` | `pending`, `approved`, `rejected` |
| Enum | `diagnosis_status` | `active`, `resolved`, `chronic` |

## Testing

```bash
npm test
```

Tests use Jest + Supertest with mocked PostgreSQL:

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

## Module Highlights

### Disease Suggestions Workflow
- Doctors submit suggestions with disease name, ICD-10 code, category, severity, and description
- Admin reviews pending suggestions and approves or rejects
- On approval, the disease is automatically created in the registry and severity is preserved
- Duplicate disease names within the same category are handled gracefully

### Patient Registration with Initial Diagnosis
- When registering a patient, an optional initial diagnosis can be assigned
- Creating a patient with a disease_id atomically creates both the patient record and a medical record entry
- The operation runs in a database transaction for data consistency
