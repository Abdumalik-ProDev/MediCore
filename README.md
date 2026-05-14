# MediCore MRMS

**Medical Record Management System** for CareTrack Clinic

A production-grade, full-stack web application for managing doctors, patients, medical diagnoses, appointments, and a centralized disease registry. Built with a modular monolith backend and a modern React frontend.

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
| **Doctor** | doctor@medicore.com | password123 |
| **Receptionist** | reception@medicore.com | password123 |

---

## Features

- **Centralized Disease Registry** — admin-managed disease catalog with categories, ICD-10 codes, and severity levels
- **Disease Suggestions Workflow** — doctors suggest new diseases, admin reviews and approves/rejects; approved suggestions auto-create registry entries
- **Complete CRUD** for Doctors, Patients, Medical Records, Appointments, Disease Categories, Receptionists
- **Patient Profile View** — full patient details with assigned doctor and complete medical history
- **Appointment Scheduling** — manage patient appointments with status tracking
- **Audit Logging** — track all system modifications for compliance
- **Advanced Search & Filtering** with pagination across all resources
- **Role-Based Access Control (RBAC)**:
  - **Administrator** — full system access (create, read, update, delete)
  - **Doctor** — manage patients, medical records, appointments; suggest new diseases
  - **Receptionist** — patient registration, appointment management, doctor directory
- **JWT Authentication** with automatic token refresh handling
- **Soft Deletes** — records are never permanently removed
- **Input Validation** — Zod schemas on both client and server
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
│   │   │   ├── diseases/     # Centralized disease registry
│   │   │   ├── disease-categories/  # Disease taxonomy
│   │   │   ├── disease-suggestions/ # Doctor suggestion workflow
│   │   │   ├── medical-records/     # Patient-disease associations
│   │   │   ├── appointments/        # Appointment scheduling
│   │   │   ├── receptionists/       # Receptionist profiles
│   │   │   ├── diagnoses/    # Legacy diagnosis module
│   │   │   └── audit-logs/   # System audit trail
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
└── AGENTS.md                 # opencode sub-agent definitions
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/api/v1/auth/login` | — | All | Authenticate and receive JWT |
| GET | `/api/v1/auth/me` | JWT | All | Current user profile |

### Doctors
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/doctors` | JWT | All | List doctors (paginated) |
| GET | `/api/v1/doctors/:id` | JWT | All | Single doctor |
| POST | `/api/v1/doctors` | JWT | Admin | Create doctor |
| PUT | `/api/v1/doctors/:id` | JWT | Admin | Update doctor |
| DELETE | `/api/v1/doctors/:id` | JWT | Admin | Soft delete doctor |

### Patients
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/patients` | JWT | All | List patients (paginated) |
| GET | `/api/v1/patients/:id` | JWT | All | Single patient |
| GET | `/api/v1/patients/:id/profile` | JWT | All | Full profile with medical records |
| POST | `/api/v1/patients` | JWT | Admin, Doctor, Receptionist | Register patient (optionally with initial diagnosis) |
| PUT | `/api/v1/patients/:id` | JWT | Admin, Doctor | Update patient |
| DELETE | `/api/v1/patients/:id` | JWT | Admin | Soft delete patient |

### Disease Registry
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/diseases` | JWT | All | List diseases (paginated, searchable) |
| GET | `/api/v1/diseases/:id` | JWT | All | Single disease |
| POST | `/api/v1/diseases` | JWT | Admin | Create disease |
| PUT | `/api/v1/diseases/:id` | JWT | Admin | Update disease |
| DELETE | `/api/v1/diseases/:id` | JWT | Admin | Soft delete disease |

### Disease Categories
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/disease-categories` | JWT | All | List categories |
| GET | `/api/v1/disease-categories/:id` | JWT | All | Single category |
| POST | `/api/v1/disease-categories` | JWT | Admin | Create category |
| PUT | `/api/v1/disease-categories/:id` | JWT | Admin | Update category |
| DELETE | `/api/v1/disease-categories/:id` | JWT | Admin | Soft delete category |

### Disease Suggestions
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/disease-suggestions` | JWT | All | List suggestions (filterable by status) |
| GET | `/api/v1/disease-suggestions/:id` | JWT | All | Single suggestion |
| POST | `/api/v1/disease-suggestions` | JWT | Admin, Doctor | Submit new disease suggestion |
| PUT | `/api/v1/disease-suggestions/:id/review` | JWT | Admin | Approve or reject suggestion |
| DELETE | `/api/v1/disease-suggestions/:id` | JWT | Admin | Delete suggestion |

### Medical Records
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/medical-records` | JWT | All | List records (filterable by patient/doctor/disease) |
| GET | `/api/v1/medical-records/:id` | JWT | All | Single record |
| POST | `/api/v1/medical-records` | JWT | Admin, Doctor | Create medical record |
| PUT | `/api/v1/medical-records/:id` | JWT | Admin, Doctor | Update medical record |
| DELETE | `/api/v1/medical-records/:id` | JWT | Admin | Soft delete record |

### Appointments
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/appointments` | JWT | All | List appointments (filterable) |
| GET | `/api/v1/appointments/:id` | JWT | All | Single appointment |
| POST | `/api/v1/appointments` | JWT | Admin, Doctor, Receptionist | Create appointment |
| PUT | `/api/v1/appointments/:id` | JWT | Admin, Doctor, Receptionist | Update appointment |
| DELETE | `/api/v1/appointments/:id` | JWT | Admin | Soft delete appointment |

### Receptionists
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/receptionists` | JWT | All | List receptionists |
| GET | `/api/v1/receptionists/:id` | JWT | All | Single receptionist |
| POST | `/api/v1/receptionists` | JWT | Admin | Create receptionist |
| PUT | `/api/v1/receptionists/:id` | JWT | Admin | Update receptionist |
| DELETE | `/api/v1/receptionists/:id` | JWT | Admin | Soft delete receptionist |

### Audit Logs
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/v1/audit-logs` | JWT | Admin | List audit logs (paginated, filterable) |
| GET | `/api/v1/audit-logs/:id` | JWT | Admin | Single audit entry |

### Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Health check |

Query parameters for list endpoints: `?page=1&limit=10&search=term&status=pending&patient_id=uuid`

---

## Database Schema

```
users ──has──▶ doctors               patients ──has──▶ medical_records ──belongs_to──▶ diseases
(id, email,      (id, name,          (id, name,        (id, severity,                   (id, name,
 password, role)  specialization,      dob, blood,       status, notes)                   icd_code,
                  license)             allergies)                                         severity)
                                                                                         │
                                         disease_suggestions ──belongs_to──▶ disease_categories
                                         (id, disease_name,                 (id, name,
                                          status, severity,                  description, icon)
                                          suggested_by, reviewed_by)
                                                     │
                                              users (FK)
```

- **Soft deletes**: All entity tables include a `deleted_at` or `is_active` flag
- **UUID primary keys**: Prevent enumeration and support distributed deployment
- **Indexed foreign keys**: Optimized for relational queries
- **ICD-10 codes**: Standard medical diagnosis coding
- **Enum types**: `user_role` (admin, doctor, receptionist), `diagnosis_severity` (mild, moderate, severe, critical), `suggestion_status` (pending, approved, rejected)

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

# Frontend builds successfully
cd frontend && npm run build
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
