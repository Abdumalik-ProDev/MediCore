# MRMS Frontend Documentation

## Technology Stack

- **React 18** + **Vite**
- **Tailwind CSS** (Medical theme)
- **React Router v6**
- **TanStack Query** (data fetching & caching)
- **React Hook Form** + Zod validation
- **Lucide React** (icons)
- **Axios** (HTTP client)

## Design System

**Color Palette** (Medical Professional):
- Primary: Teal `#006666`
- Accent: Green `#00A36C`
- Neutral: Soft blues, warm grays, clean white
- Alerts: Soft red for critical actions

**Typography**: Clean, highly readable sans-serif fonts

## Pages & Features

- **Login** – Role-aware authentication
- **Dashboard** – Overview with statistics for Admin panel
- **Doctors** – List, Create, View, Edit, Delete
- **Patients** – Full CRUD + Search/Filter
- **Patient Profile** – Complete view (Doctor + All Diagnoses)
- **Diagnoses** – Management linked to patients
- **Role-based UI** – Different navigation and permissions per role

## Key Features

- Responsive design (mobile + desktop)
- Real-time search and filtering
- Elegant data tables with pagination
- Modal-based forms
- Toast notifications
- Loading states and error handling
- Protected routes based on user role

## Project Structure (Planned)

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Main pages
│   ├── layouts/         # Dashboard, Auth layouts
│   ├── hooks/
│   ├── services/        # API calls
│   ├── stores/          # State management (Context / Zustand)
│   ├── utils/
│   └── assets/


## Development

```bash
cd frontend
npm install
npm run dev

ntegration

Connects to backend via Axios with JWT token handling
Automatic token refresh support
Centralized error handling

Design Philosophy
Clean, calm, trustworthy medical interface optimized for clinical workflow and speed. High emphasis on readability and reducing cognitive load for doctors, clinicians, and receptionists.

Frontend is designed to be fast, intuitive, and fully aligned with CareTrack Clinic’s operational needs.
