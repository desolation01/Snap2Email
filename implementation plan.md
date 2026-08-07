# Trucking Service Management System — Project Plan

## 1. Overview

This document outlines a full system plan for an internal management platform for a trucking service company. The company sources delivery/pickup jobs through the **Transportify** platform, owns its fleet of trucks, and employs **drivers**, **helpers**, and **office staff**. Revenue (gross) and cost (expense) per trip are pulled from what Transportify quotes/pays, and driver/helper compensation is a **customizable percentage of gross or profit per trip**.

The system will be a web-based dashboard, accessible only to the **Owner** and **Office Staff**, covering:

- Trip logging & management (linked to Transportify jobs)
- Automated profit computation and commission/salary computation
- Financial dashboard (income, expense, profit — daily/weekly/monthly)
- Trip analytics (trip counts over time)
- Full calendar view of trips and daily profit
- Search, sort, and filter across all trip data
- Employee & payroll management
- Role-based access (Admin/Office Staff, Driver, Helper)

---

## 2. Goals & Non-Goals

### Goals
- Centralize all trip records currently possibly tracked in spreadsheets/manually.
- Automate profit and commission calculations to reduce human error.
- Give management real-time visibility into income, expenses, and trip volume.
- Provide a fast way to search/filter historical trips (fuzzy search).
- Provide a calendar-first view of operations for quick day-to-day reference.
- Make commission/salary rules configurable without code changes.

### Non-Goals (v1)
- Direct API integration with Transportify (assume no public API access — data is manually entered by office staff after a trip is booked/completed on Transportify. This can be revisited if Transportify exposes a partner API in the future).
- Route optimization / live GPS tracking (can be a phase 2 feature).
- Customer-facing portal (this is an internal ops tool only).

---

## 3. User Roles & Permissions

This system is an **internal back-office tool**. Drivers and helpers are tracked as employee records (for trip assignment, commission computation, and payroll reporting) but **do not have login access** to the platform. Only the following roles can log in:

| Role | Access |
|---|---|
| **Owner / Admin** | Full access: dashboard, trips, employees, vehicles, payroll settings, commission rules, reports, user management |
| **Office Staff / Dispatcher** | Create/edit trips, view dashboard, view calendar, manage customers, manage employee & vehicle records — cannot edit commission rules or payroll settings (configurable) |
| **Accountant/Payroll (optional role)** | View financials, generate payroll reports, cannot create/edit trips |

Drivers and Helpers exist only as **Employee records** referenced by trips — they are selected from a dropdown when office staff logs a trip, and their commission is computed and stored for payroll purposes, but they never log into the system themselves.

Authentication: email/username + password via Supabase Auth, with optional OTP/2FA for Owner accounts.

---

## 4. Core Modules & Features

### 4.1 Authentication & User Management
- Login, forgot password, role assignment — for **Owner and Office Staff accounts only**
- Owner can create/deactivate Office Staff logins
- Employee profile (drivers, helpers, office staff): name, contact info, role, license info (for drivers), date hired, status (active/inactive) — this is a data record, not necessarily a login account. Only Office Staff and Owner roles get actual login credentials.

### 4.2 Trip Management

**Add New Trip — Fields:**
| Field | Type | Notes |
|---|---|---|
| Driver | Dropdown (linked to Employee table, filtered by role=Driver) | Required |
| Helper(s) | Multi-select dropdown (linked to Employee table, filtered by role=Helper) | Supports 0, 1, or multiple helpers |
| Vehicle Type | Dropdown (e.g., L300, 4-Wheeler, 6-Wheeler Fwd, 10-Wheeler Wingvan, etc.) | Configurable list in settings |
| Vehicle / Plate Number | Dropdown or text, linked to Vehicle table | Required |
| Transportify Booking ID | Text | Required, used for reconciliation with Transportify records |
| Cargo Weight | Number (kg) | |
| Cargo Dimensions | Text or L×W×H numeric fields | |
| Customer Phone Number | Text, validated format | |
| Pickup Address | Text / Google Maps autocomplete | |
| Drop-off Address(es) | Text / Google Maps autocomplete, supports multiple drop points | |
| Items | Text or tag list | |
| Description / Notes | Textarea | |
| Image(s) | File upload (proof of delivery, cargo photo, etc.) | Multiple images supported |
| Gross | Currency (₱) | Amount billed via Transportify |
| Expense | Currency (₱) | Fuel, tolls, misc — can be itemized (see 4.2.1) |
| Date & Time | Date-time picker | Trip date, used for calendar + reports |
| Trip Status | Dropdown | Scheduled / Ongoing / Completed / Cancelled |
| **Profit** | Auto-computed | `Profit = Gross - Expense` |
| **Driver Commission** | Auto-computed | Based on configurable rule (see 4.4) |
| **Helper Commission** | Auto-computed | Based on configurable rule (see 4.4), split evenly or by custom % if multiple helpers |

#### 4.2.1 Expense Breakdown (optional sub-feature)
Instead of one lump "Expense" field, allow itemized expenses:
- Fuel
- Toll fees
- Parking
- Driver allowance/per diem
- Miscellaneous
This gives better reporting granularity while still rolling up into a single `total_expense` for profit calc.

### 4.3 Sorting & Filtering
- Sort by: Vehicle Type, Date (Asc/Desc), Gross (Asc/Desc), Profit (Asc/Desc), Driver, Status
- Filter by: Date range, Driver, Helper, Vehicle Type, Status, Customer
- Combine sort + filter + search simultaneously

### 4.4 Fuzzy Search
- Single search bar queries across: driver name, helper name(s), vehicle plate, Transportify ID, customer phone number, pickup/drop-off address, item description, and notes.
- Implemented via fuzzy matching (typo-tolerant, partial match) — see tech stack section for library choice (e.g., Fuse.js on frontend for small datasets, or Postgres `pg_trgm` / Elasticsearch for larger scale).

### 4.5 Commission / Salary Configuration Engine
This is a **rules engine**, configurable by Admin without touching code.

**Configurable parameters:**
- Base commission % for Drivers (e.g., 10% of gross, or 10% of profit — toggle basis)
- Base commission % for Helpers
- Per-vehicle-type override (e.g., 10-wheeler trips pay drivers a different % than L300 trips)
- Per-employee override (e.g., senior driver gets +2%)
- Split logic when multiple helpers are assigned (equal split vs. custom %)
- Minimum guaranteed pay per trip (floor amount) — optional
- Computation basis toggle: `% of Gross` vs `% of Profit (Gross - Expense)`

**Example rule record:**
```json
{
  "role": "driver",
  "basis": "profit",
  "default_percentage": 12,
  "vehicle_type_overrides": {
    "10-Wheeler Wingvan": 15
  },
  "employee_overrides": {
    "employee_id_123": 14
  }
}
```

When a trip is saved, the system evaluates: employee override → vehicle-type override → default %, in that priority order, then computes commission and stores it against the trip AND against a payroll ledger entry for that employee.

### 4.6 Dashboard (Analytics)
- **KPI Cards (top of dashboard):** Total Gross, Total Expense, Total Profit, Total Trips — each with Daily / Weekly / Monthly toggle
- **Income vs Expense — Bar Graph:** grouped bars per day/week/month
- **Profit Trend — Line Graph:** shows profit trajectory over selected period
- **Gross Breakdown by Vehicle Type — Pie Chart**
- **Trip Count Over Time — Bar Graph:** daily/weekly/monthly trip volume
- **Top Drivers by Trips/Profit Generated — Horizontal Bar / Leaderboard table**
- **Expense Breakdown — Pie/Donut Chart:** fuel vs tolls vs misc (if itemized expenses used)
- **Date Range Selector:** custom range, plus quick filters (Today, This Week, This Month, This Quarter, This Year)
- All charts filterable by vehicle type / driver, exportable as image or PDF

### 4.7 Calendar Feature
- Full month-view calendar (with week/day view toggle)
- Each date cell shows:
  - Total profit for that day (₱ figure)
  - Number of trips that day (badge/counter)
  - Small color indicator (e.g., green = profitable day, red = loss day, gray = no trips)
- Clicking a date opens a **day detail panel/modal** listing every trip that day with key info (driver, vehicle, gross, expense, profit, status) and a link to view/edit full trip details.
- Calendar auto-updates in real time when a new trip is added (shared data source with Trip module — no separate manual entry).
- Filter calendar by driver/vehicle type (e.g., "show only Truck A's trips").

### 4.8 Payroll / Commission Reports
- Per-employee payroll summary for a selected date range (auto-computed from trip commission data)
- Exportable to PDF/Excel for actual payroll processing/payout
- Shows: number of trips, total gross contributed, total commission earned, breakdown per trip

### 4.9 Employee Management
- CRUD for drivers, helpers, office staff
- Assign/View trip history per employee
- Track employment status, hire date, documents (license, NBI clearance, etc. — optional file uploads)

### 4.10 Vehicle Management
- CRUD for company trucks: plate number, type, capacity, registration/insurance expiry reminders (optional), maintenance log (optional phase 2)

### 4.11 Customer Records (lightweight)
- Auto-created/linked from trip entries based on phone number
- View customer's trip history (repeat customer tracking)

### 4.12 Notifications (optional phase 2)
- Reminders for upcoming scheduled trips
- Alerts for vehicle registration/insurance expiry
- Daily digest summary sent to Admin (email or in-app)

### 4.13 Settings
- Manage vehicle type list
- Manage commission rules (see 4.5)
- Manage user roles/permissions
- Company profile info (used in exported reports/invoices)

---

## 5. Data Model (High-Level Entities)

- **User** (id, name, email, password_hash, role, status)
- **Employee** (id, user_id [nullable if no login needed], name, role[driver/helper/staff], contact_info, hire_date, status, documents)
- **Vehicle** (id, plate_number, type, capacity, status)
- **Trip** (id, driver_id, helper_ids[], vehicle_id, transportify_id, cargo_weight, cargo_dimensions, customer_phone, pickup_address, dropoff_address, items, description, images[], gross, expense_items[], total_expense, profit [computed], date_time, status, created_by, created_at, updated_at)
- **CommissionRule** (id, role, basis[gross/profit], default_percentage, vehicle_type_overrides{}, employee_overrides{}, min_guaranteed_pay)
- **PayrollLedgerEntry** (id, employee_id, trip_id, computed_amount, basis_used, date)
- **Customer** (id, phone_number, name[optional], trip_history[])
- **ExpenseItem** (id, trip_id, category, amount, note)

---

## 6. Recommended Tech Stack

### Frontend
- **Framework:** React (with Vite) or Next.js (if SSR/SEO not needed, plain React + Vite is lighter/faster for an internal tool)
- **UI Library:** Tailwind CSS + shadcn/ui (clean, fast to build professional dashboards) or Ant Design (rich out-of-the-box components good for admin dashboards/tables)
- **Charts:** Recharts (simple, React-native) or Apache ECharts (more powerful, better for combo dashboards with many chart types)
- **Calendar:** FullCalendar (React wrapper) — supports month/week/day views and custom cell rendering (needed for showing profit + trip count per day)
- **Fuzzy Search (client-side option):** Fuse.js — good for datasets up to a few thousand records rendered client-side
- **Forms:** React Hook Form + Zod for validation
- **State Management:** React Query (TanStack Query) for server state; Zustand or Context API for lightweight local/UI state
- **Image Upload/Preview:** react-dropzone

### Backend
- **Primary approach:** **Supabase** as the backend-as-a-service layer — Postgres database, auto-generated REST API (PostgREST), Auth, and Storage all managed together
- **Custom Logic:** **Supabase Edge Functions** (Deno-based serverless functions) for logic that shouldn't live purely in the database or frontend, such as:
  - The commission engine (evaluating employee override → vehicle-type override → default %)
  - PDF/Excel payroll report generation
  - Any scheduled/cron jobs (e.g., recomputing monthly summaries)
- **Optional thin Node.js layer:** If the team wants a more traditional custom backend alongside Supabase (e.g., NestJS or Express) for heavier business logic, it can connect directly to the Supabase Postgres database using a service-role key — this is optional and not required for MVP, since Supabase can handle most CRUD + auth + storage needs directly
- **Authentication:** Supabase Auth (JWT-based), with Row Level Security policies enforcing that only Owner and Office Staff roles can read/write data
- **API Style:** REST via Supabase's auto-generated API, supplemented by Edge Functions for custom endpoints

### Database & Backend Platform
- **Primary DB + Backend:** **Supabase** (PostgreSQL under the hood)
  - Managed Postgres — supports `pg_trgm` extension for server-side fuzzy/trigram search at scale
  - Strong support for JSONB (useful for storing commission rule overrides, cargo dimensions, itemized expenses)
  - Built-in **Supabase Auth** — handles Owner/Office Staff login, password reset, and role-based access via Row Level Security (RLS) policies (drivers/helpers never get accounts, so RLS policies only need to distinguish Owner vs Office Staff)
  - Built-in **Supabase Storage** — for trip images and employee documents (replaces need for separate S3/R2 setup)
  - Auto-generated REST & realtime APIs (via PostgREST) can reduce or even replace the need for a fully custom backend for simpler CRUD operations, while still allowing custom serverless functions (Supabase Edge Functions) for the commission engine logic, report generation, etc.
  - Realtime subscriptions can be used so the Calendar and Dashboard auto-update the moment Office Staff adds a new trip, without manual refresh
- **ORM/Client:** Supabase JS Client for straightforward queries; Prisma can still be used on top of the same Postgres instance if the team prefers a typed ORM layer for complex commission/report queries

### File/Image Storage
- **Object Storage:** **Supabase Storage** — for trip images (proof of delivery, cargo photos) and employee documents, with RLS-based access control matching the database roles

### Search (if scaling beyond a few thousand trips)
- Start with Postgres `pg_trgm` + full-text search — sufficient for most trucking companies' trip volumes
- Upgrade path: Meilisearch (self-hostable, very fast, purpose-built for fuzzy/typo-tolerant search, easier to run than Elasticsearch) if search needs grow

### Hosting / Infrastructure
- **Frontend Hosting:** Vercel or Netlify
- **Backend Hosting:** Railway, Render, or a small VPS (DigitalOcean/Linode) — or AWS/GCP if the company wants more control
- **Database Hosting:** Managed Postgres (Supabase, Railway, Neon, or AWS RDS)
- **CI/CD:** GitHub Actions for automated testing/deployment

### Reporting/Export
- **PDF Generation:** Puppeteer (server-side HTML-to-PDF) or `pdf-lib` for structured payroll/report PDFs
- **Excel Export:** SheetJS (xlsx) for exporting payroll and trip reports

### Optional / Phase 2
- **Email Notifications:** Resend or SendGrid, triggered via Supabase Edge Functions (e.g., for registration expiry alerts or daily digest summaries sent to the Owner)
- **Maps/Address Autocomplete:** Google Maps Places API for pickup/drop-off address fields

---

## 7. Suggested Tech Stack Summary (Recommended Default)

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript |
| UI/Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Calendar | FullCalendar (React) |
| Backend | Supabase (Postgres + Auto REST API + Edge Functions) |
| Database | Supabase Postgres (+ pg_trgm for fuzzy search) |
| Auth | Supabase Auth (Owner & Office Staff logins only, RLS-enforced) |
| File Storage | Supabase Storage |
| Hosting (FE) | Vercel |
| Hosting (BE + DB) | Supabase (managed) |
| PDF/Excel Export | Puppeteer or Edge Function + SheetJS |

This stack is chosen for: strong TypeScript support end-to-end (fewer bugs, easier maintenance), fast setup since Supabase bundles database, auth, storage, and API generation together, reasonable hosting cost for a small-to-mid size company, and a clear upgrade path (Meilisearch, dedicated Node.js backend, GraphQL) if the company grows.

---

## 8. System Architecture (High-Level)

```
[React Frontend (Dashboard, Trips, Calendar, Reports)]
     — used only by Owner & Office Staff (login required)
              |
   Supabase Client SDK (HTTPS, JWT via Supabase Auth)
              |
        [Supabase Platform]
   |-- Auth (Owner / Office Staff logins only)
   |-- Auto-generated REST API (PostgREST)
   |-- Edge Functions
   |     |-- Commission Engine Logic
   |     |-- Payroll Report Generation (PDF/Excel)
   |     |-- Scheduled/Cron Jobs
   |-- Row Level Security Policies (role-based data access)
              |
      [Supabase Postgres Database]
   (Trips, Employees, Vehicles, Customers, CommissionRules, PayrollLedger)
              |
      [Supabase Storage] (trip images, employee documents)
```

Note: Drivers and helpers are stored purely as **data** (rows in the Employee table) — they are never issued Supabase Auth accounts and never access this system directly.

---

## 9. Development Phases / Roadmap

**Phase 1 — MVP (Core Operations)**
- Auth & role-based access
- Employee & Vehicle management
- Trip CRUD (all fields from 4.2)
- Auto profit computation
- Basic commission engine (default % only, no overrides yet)
- Trip list with sort + fuzzy search
- Basic dashboard (KPI cards + bar/pie charts)
- Basic calendar view with profit/trip count per day + day detail modal

**Phase 2 — Refinement**
- Commission rule overrides (per vehicle type, per employee)
- Itemized expenses
- Payroll report generation (PDF/Excel export)
- Customer history tracking
- Image upload for trips (proof of delivery)
- Advanced dashboard filters (by driver, vehicle type, date range)

**Phase 3 — Scale & Extras**
- Notifications (registration expiry, daily digest) via Supabase Edge Functions + email provider
- Upgrade search to Meilisearch if data volume grows beyond what `pg_trgm` handles comfortably
- Vehicle maintenance logs
- Optional Transportify data import automation (CSV import or API if available)

---

## 10. Security & Data Considerations
- Role-based access control enforced via **Supabase Row Level Security (RLS)** policies at the database level, not just in the UI — critical since drivers/helpers have zero login access, and only Owner/Office Staff roles should ever read or write data
- Encrypt sensitive fields (customer phone numbers) at rest if required by policy
- Audit log for trip edits/deletions (who changed what, when) — important since this affects payroll
- Regular automated database backups (Supabase provides daily backups on paid tiers — confirm plan covers this)
- Rate limiting and input validation on all API endpoints / Edge Functions
- Image uploads scanned/validated for file type and size limits before hitting Supabase Storage

---

