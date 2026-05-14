# MRMS Backend Documentation

## Architecture

**Type**: Modular Monolith  
**Framework**: Express.js (Node.js)  
**Database**: PostgreSQL with `pg` pool

### Folder Structure

src/
├── common/                 # Shared infrastructure
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── utils/
│   └── errors/
├── modules/
│   ├── auth/
│   ├── doctors/
│   ├── patients/
│   └── diagnoses/
├── app.js
└── server.js


## Core Modules

- **Auth Module** – JWT authentication + role management
- **Doctors Module** – Doctor profile management
- **Patients Module** – Patient records + doctor assignment
- **Diagnoses Module** – Disease/Diagnosis records linked to patients

## Key Technologies

- Express.js
- PostgreSQL + `pg` (connection pooling)
- JWT + bcryptjs
- Pino (logging)
- CORS
- Swagger UI (medical-themed)
- Jest + Supertest

## Security Features

- JWT-based authentication
- Role-based authorization middleware
- Password hashing
- Input sanitization
- Soft deletes for medical records

## Docker Setup

```bash
docker-compose up --build

Services:

api – Node.js backend
postgres – PostgreSQL database

API Documentation
Swagger UI available at: http://localhost:5000/api-docs
Base URL: /api/v1
Main Endpoints:

POST /api/v1/auth/login
GET/POST/PUT/DELETE /api/v1/doctors
GET/POST/PUT/DELETE /api/v1/patients
GET/POST/PUT/DELETE /api/v1/diagnoses
GET /api/v1/patients/:id/profile (Full patient view)

Design Decisions

Modular monolith for optimal balance between simplicity and maintainability
Repository pattern for data access
Thin controllers + rich services
