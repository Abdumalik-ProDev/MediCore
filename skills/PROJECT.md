# Medical Record Management System (MRMS) - CareTrack Clinic

## Project Overview

**Project Name**: MediCore MRMS  
**Client**: CareTrack Clinic  
**Company**: MediCore Solutions  
**Architecture**: Modular Monolith (Backend) + Modern React Frontend  
**Stack**: PERN (PostgreSQL, Express.js, React, Node.js)

## Project Objective

To replace CareTrack Clinic’s paper-based and spreadsheet systems with a secure, efficient, and user-friendly web-based Medical Record Management System that enables seamless management of doctors, patients, and diagnoses across multiple departments.

## Key Features

- Complete CRUD operations for Doctors, Patients, and Diagnoses
- Strong relational data model (Doctor 1→N Patient, Patient 1→N Diagnosis)
- Full Patient Profile view with assigned doctor and complete diagnosis history
- Advanced search and filtering with pagination
- Role-Based Access Control (RBAC):
  - **Administrator** – Full system access
  - **Clinician** – View & update Patient + Diagnosis records
  - **Receptionist** – Patient registration and Doctor directory access
- Secure JWT authentication
- Responsive, medical-grade user interface
- Dockerized deployment

## Technology Stack

**Backend**: Node.js + Express.js (Modular Monolith) + PostgreSQL  
**Frontend**: React.js + Vite + Tailwind CSS + React Router + TanStack Query  
**DevOps**: Docker + Docker Compose  
**Documentation**: Swagger UI (Backend)  
**Testing**: Jest + Supertest (Backend), Vitest + React Testing Library (Frontend)

## Project Structure

- `/backend` – Express.js modular monolith API
- `/frontend` – React.js single-page application
- `/docker-compose.yml` – Full stack orchestration

## Design Philosophy

- Clean, professional medical aesthetic (teal, deep green, soft blues, white)
- High usability for clinical staff
- Strong emphasis on data security and privacy
- Modular, maintainable, and scalable architecture
- Full compliance with assignment requirements (CRUD, relationships, RBAC, search, testing, feedback cycles)

---

**Status**: Completed | **Version**: 1.0

**Prepared for**: CareTrack Clinic Management  
**Date**: May 2026
