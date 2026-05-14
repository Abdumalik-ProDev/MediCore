# MediCore MRMS

**Medical Record Management System** for CareTrack Clinic

A production-grade, full-stack web application for managing doctors, patients, and medical diagnoses across multiple departments. Built with a modular monolith backend and a modern React frontend.

---

## Architecture Overview

```
                            ┌─────────────┐
                            │   Browser    │
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │   Nginx     │  (port 3000)
                            │  (Frontend) │
                            └──────┬──────┘
                                   │ /api/*
                            ┌──────▼──────┐
                            │  Express.js │  (port 5000)
                            │    (API)    │
                            └──────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │ PostgreSQL  │  (port 5432)
                            │             │
                            └─────────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, TanStack Query | Single-page application with role-based UI |
| **Backend** | Node.js, Express.js (modular monolith) | RESTful API with JWT authentication |
| **Database** | PostgreSQL 16 | Relational data with soft deletes |
| **DevOps** | Docker Compose | Full-stack orchestration |

---

## Quick Start

```bash
docker-compose up --build
```

| Service | URL | Credentials |
|---|---|---|
| **Web App** | http://localhost:3000 | — |
| **API** | http://localhost:5000 | — |
| **Health** | http://localhost:5000/health | — |

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | admin@medicore.com | password123 |
| **Clinician** | clinician@medicore.com | password123 |
| **Receptionist** | reception@medicore.com | password123 |

---

## Features

- **Complete CRUD** for Doctors, Patients, and Diagnoses
- **Patient Profile View** — full patient details with assigned doctor and complete diagnosis history
- **Advanced Search & Filtering** with pagination across all resources
- **Role-Based Access Control (RBAC)**:
  - **Administrator** — full system access (create, read, update, delete)
  - **Clinician** — view and update patient and diagnosis records
  - **Receptionist** — patient registration and doctor directory access
- **JWT Authentication** with automatic token refresh handling
- **Soft Deletes** — medical records are never permanently removed
- **Responsive UI** — mobile and desktop optimized
- **Dockerized Deployment** — one command to run the full stack

---

## Project Structure

```
full-stack/
├── backend/                  # Express.js API (modular monolith)
│   ├── src/
│   │   ├── common/           # Shared infrastructure
│   │   │   ├── config/       # Environment & logger config
│   │   │   ├── database/     # Pool, migrations, seeds
│   │   │   ├── middleware/   # Auth, RBAC, validation, error handling
│   │   │   ├── errors/       # Custom error classes
│   │   │   └── utils/        # Helpers & pagination
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication & authorization
│   │   │   ├── doctors/      # Doctor management
│   │   │   ├── patients/     # Patient records
│   │   │   └── diagnoses/    # Diagnosis management
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # Entry point
│   ├── tests/                # Jest + Supertest
│   └── Dockerfile
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── layouts/          # Auth & dashboard layouts
│   │   ├── services/         # API client (Axios)
│   │   ├── stores/           # Auth context
│   │   └── utils/            # Formatters & constants
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml        # Full stack orchestration
├── AGENTS.md                 # Caveman agent definition
└── bin/caveman               # CLI text compressor
```

---

## API Endpoints

| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | — | All | Authenticate and receive JWT |
| GET | `/api/v1/auth/me` | JWT | All | Current user profile |
| GET | `/api/v1/doctors` | JWT | All | List doctors (paginated) |
| GET | `/api/v1/doctors/:id` | JWT | All | Single doctor |
| POST | `/api/v1/doctors` | JWT | Admin | Create doctor |
| PUT | `/api/v1/doctors/:id` | JWT | Admin | Update doctor |
| DELETE | `/api/v1/doctors/:id` | JWT | Admin | Soft delete doctor |
| GET | `/api/v1/patients` | JWT | All | List patients (paginated) |
| GET | `/api/v1/patients/:id` | JWT | All | Single patient |
| GET | `/api/v1/patients/:id/profile` | JWT | All | Full patient profile with diagnoses |
| POST | `/api/v1/patients` | JWT | Admin, Receptionist | Register patient |
| PUT | `/api/v1/patients/:id` | JWT | Admin, Clinician | Update patient |
| DELETE | `/api/v1/patients/:id` | JWT | Admin | Soft delete patient |
| GET | `/api/v1/diagnoses` | JWT | All | List diagnoses (paginated, filterable) |
| GET | `/api/v1/diagnoses/:id` | JWT | All | Single diagnosis |
| POST | `/api/v1/diagnoses` | JWT | Admin, Clinician | Create diagnosis |
| PUT | `/api/v1/diagnoses/:id` | JWT | Admin, Clinician | Update diagnosis |
| DELETE | `/api/v1/diagnoses/:id` | JWT | Admin | Soft delete diagnosis |

Query parameters for list endpoints: `?page=1&limit=10&search=term&doctor_id=uuid`

---

## Database Schema

```
users       ──has──▶  doctors       ──has──▶  patients       ──has──▶  diagnoses
(id, email,            (id, name,                (id, name,                (id, name,
 password, role)        specialization,           dob, blood,               ICD-10, severity,
                        license)                  allergies)                status, notes)
```

- **Soft deletes**: All entity tables include a `deleted_at` timestamp
- **UUID primary keys**: Prevent enumeration and support distributed deployment
- **Indexed foreign keys**: Optimized for relational queries
- **ICD-10 codes**: Standard medical diagnosis coding

---

## Development

### Backend

```bash
cd backend
npm install
npm run dev        # starts with --watch for auto-reload
npm test           # runs Jest test suite
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts Vite dev server on port 5173
npm run build      # production build to dist/
```

### Environment Variables

See `.env.example` for all configurable variables. Key settings:

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | mrmspg | Database name |
| `DB_USER` | mrmspg | Database user |
| `DB_PASSWORD` | mrmspg | Database password |
| `JWT_SECRET` | (required) | JWT signing key |
| `JWT_EXPIRES_IN` | 24h | Token expiration |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |

---

## Security

- **JWT authentication** with bcrypt password hashing
- **Role-based authorization** middleware per endpoint
- **Input validation** via Zod schemas (both client and server)
- **Soft deletes** for data retention compliance
- **Prepared SQL statements** prevent injection
- **CORS** restricted to configured origin

---

## Testing

```bash
# Backend (Jest + Supertest)
cd backend && npm test
# 20 tests across 4 modules (auth, doctors, patients, diagnoses)

# Frontend builds successfully
cd frontend && npm run build
```

---

## Caveman Agent

A minimalist text compressor that reduces verbose input to 5 words or fewer.

```bash
# CLI usage
echo "This is a very long explanation that should be shortened" | ./bin/caveman
# Output: This is a very long.

# AGENTS.md sub-agent (for opencode IDE)
# Name: caveman
# Role: text compressor
```

---

## Design System

The MediCore Medical Theme is available as a Stitch design system:
- **Primary**: `#006666` (Teal)
- **Font**: Inter (body and headlines)
- **Roundness**: 8px
- **Mode**: Light
- **Variant**: Tonal Spot

---

## License

Proprietary — MediCore Solutions for CareTrack Clinic