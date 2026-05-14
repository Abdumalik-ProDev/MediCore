# MediCore MRMS — Frontend

React single-page application for the Medical Record Management System.

---

## Technology Stack

| Library | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling with medical theme |
| **React Router v6** | Client-side routing with role guards |
| **TanStack Query** | Server state management, caching, pagination |
| **React Hook Form** | Performant form handling |
| **Zod** | Schema validation (shared with backend) |
| **Axios** | HTTP client with JWT interceptor |
| **Lucide React** | Icon library |

## Theme

Medical professional color palette:

- **Primary**: Teal `#006666`
- **Accent**: Green `#00A36C`
- **Neutral**: Soft blues, warm grays
- **Alert**: Red for destructive actions

## Project Structure

```
src/
├── components/           # Reusable UI components
│   └── ui/               # Atomic design atoms (Button, Input, Select, Badge, Spinner)
├── pages/                # Route-level page components
├── layouts/              # AuthLayout, DashboardLayout (sidebar + topbar)
├── services/             # Axios instance with JWT interceptor
├── stores/               # AuthContext (user state, login, logout)
├── utils/                # Formatters (dates, names), constants (roles, nav items)
└── assets/               # Static assets
```

## Pages

| Page | Route | Access | Description |
|---|---|---|---|
| Login | `/login` | Public | Email/password authentication |
| Dashboard | `/` | All roles | Statistics cards, recent patients |
| Doctors | `/doctors` | Admin, Receptionist | Data table with CRUD modals |
| Patients | `/patients` | All roles | Data table with search, filter, CRUD |
| Patient Profile | `/patients/:id` | All roles | Full profile with diagnoses history |
| Diagnoses | `/diagnoses` | All roles | Data table with CRUD modals |
| 404 | `*` | All | Not found page |

## Components

### Atomic
- `Button` — primary, secondary, danger, ghost variants
- `Input` — with label, error state, forwardRef
- `Select` — with label, error state, forwardRef
- `Badge` — colored by variant (severity, status, role)
- `Spinner` — sm, md, lg sizes

### Compound
- `DataTable` — sortable columns, paginated, loading/empty states
- `Modal` — portal-based, backdrop close, ESC key, size variants
- `Toast` — stackable notifications (success, error, info)
- `SearchInput` — debounced input with search icon
- `Pagination` — page numbers with ellipsis
- `EmptyState` — icon + message for zero results
- `ConfirmDialog` — destructive action confirmation modal
- `ProtectedRoute` — auth + role-gated route wrapper

## Setup

```bash
npm install
npm run dev        # Vite dev server on port 5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

## Development

### Proxy Configuration

The Vite dev server proxies `/api` requests to `http://localhost:5000` (configured in `vite.config.js`). In production, Nginx handles the reverse proxy.

### Auth Flow

1. User submits credentials → `POST /api/v1/auth/login`
2. JWT stored in `localStorage`, user object in AuthContext
3. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
4. On 401 response, token is cleared and user is redirected to login
5. `ProtectedRoute` component checks authentication and role before rendering

### Adding a New Page

```jsx
// 1. Create the page component in src/pages/
// 2. Add the route in src/App.jsx
// 3. Add nav item in src/utils/constants.js (if sidebar visible)
// 4. Create API service functions in a new file under src/services/
```

## Production Build

```bash
npm run build
# Output in dist/
# Served via Nginx (see nginx.conf)
```

The production Docker image uses a multi-stage build: Vite compiles assets in the builder stage, then an `nginx:alpine` image serves the static files with an API reverse proxy.
