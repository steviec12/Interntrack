# ============================================================================
# InternTrack — Antigravity Rules File
# Job & Internship Application Tracker for Early Career Students
# ============================================================================

# ============================================================================
# 1. PROJECT CONTEXT
# ============================================================================

## Tech Stack and Versions

- **Frontend:** React 18+ with TypeScript, built with Vite 5+
- **UI Library:** Ant Design 5+ for layout, tables, forms, modals, and filters
- **Drag-and-Drop:** dnd-kit (core + sortable) for Kanban board interactions
- **Backend:** Python 3.11+ with FastAPI 0.100+
- **ORM:** SQLAlchemy 2.0+ with Alembic for database migrations
- **Database:** PostgreSQL 15+
- **Authentication:** JWT (PyJWT) with bcrypt for password hashing
- **Chrome Extension:** Manifest V3 with TypeScript
- **Testing:** Pytest (backend), Vitest (frontend)
- **Package Managers:** npm (frontend), pip (backend)

## Architecture Overview

```
interntrack/
├── frontend/                   # React + TypeScript + Vite
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Board/          # Kanban board components
│   │   │   ├── Table/          # Table view components
│   │   │   ├── Dashboard/      # Dashboard and analytics components
│   │   │   ├── Forms/          # Application form, rejection modal
│   │   │   ├── Layout/         # Nav, sidebar, page wrappers
│   │   │   └── common/         # Buttons, badges, filters, inputs
│   │   ├── pages/              # Route-level page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── BoardPage.tsx   # Main view (Kanban + Table toggle)
│   │   │   └── DashboardPage.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client functions
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Helper functions
│   │   ├── App.tsx             # Root component with routing
│   │   └── main.tsx            # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                    # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Environment and database config
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── application.py
│   │   │   ├── reminder.py
│   │   │   └── contact.py
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── routers/            # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── applications.py
│   │   │   ├── reminders.py
│   │   │   └── analytics.py
│   │   ├── services/           # Business logic layer
│   │   ├── dependencies.py     # Dependency injection (auth, db session)
│   │   └── utils/              # Helpers (duplicate detection, etc.)
│   ├── alembic/                # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/                  # Pytest tests
│   │   ├── test_auth.py
│   │   ├── test_applications.py
│   │   ├── test_reminders.py
│   │   └── test_analytics.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env
├── extension/                  # Chrome Extension (Manifest V3)
│   ├── src/
│   │   ├── popup.tsx           # Extension popup UI
│   │   ├── background.ts      # Service worker
│   │   └── content.ts         # Content scripts for job page scraping
│   ├── manifest.json
│   └── tsconfig.json
├── .antigravityrules           # This file
├── .gitignore
└── README.md
```

## Key Architectural Patterns

- **Frontend:** Component-based architecture. Each feature has its own folder under `components/`. Pages compose components. State is managed with React hooks (useState, useEffect, useContext). API calls are centralized in `services/`.
- **Backend:** Layered architecture with routers (HTTP handling) → services (business logic) → models (database). Pydantic schemas validate all request/response data. Dependencies are injected via FastAPI's `Depends()`.
- **API Design:** RESTful. All endpoints prefixed with `/api/v1`. JSON request/response bodies. JWT token sent via Authorization header (`Bearer <token>`).
- **Database:** Relational model. Foreign keys enforce relationships. Enums for status and type fields. Timestamps on all records.

## Naming Conventions and Coding Standards

### Frontend (TypeScript/React)
- **Files:** PascalCase for components (`KanbanBoard.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components:** PascalCase function components with default exports
- **Hooks:** Prefix with `use` (`useApplications.ts`)
- **Types/Interfaces:** PascalCase with descriptive names (`Application`, `CreateApplicationRequest`)
- **CSS:** Use Ant Design's built-in styling system. Inline styles only for prototype; prefer Ant Design's `className` and design tokens for production
- **Props:** Define explicit TypeScript interfaces for all component props
- **No `any` types.** Always define explicit types.

### Backend (Python/FastAPI)
- **Files:** snake_case (`application.py`, `auth.py`)
- **Classes:** PascalCase (`Application`, `UserCreate`)
- **Functions/Variables:** snake_case (`get_applications`, `current_user`)
- **Constants:** UPPER_SNAKE_CASE (`ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Pydantic models:** PascalCase with verb prefix for request schemas (`CreateApplication`, `UpdateApplication`) and suffix for responses (`ApplicationResponse`)
- **Router prefixes:** plural nouns (`/applications`, `/reminders`)
- **All functions must have type hints** for parameters and return values

### General
- **No magic numbers.** Use named constants.
- **No commented-out code** in commits.
- **Docstrings** on all service functions and complex utility functions.
- **Error messages** must be user-friendly and never expose internal details.

## Testing Strategy

### Backend (Pytest)
- **Unit tests:** Test business logic in `services/` — duplicate detection algorithm, analytics calculations, rejection pattern aggregation
- **Integration tests:** Test API endpoints with a test database — CRUD operations, auth flows, filtering, edge cases
- **Auth tests:** Test registration, login, token refresh, protected route access, invalid token handling
- **Coverage goal:** 80%+ on `services/` and `routers/`
- **Fixtures:** Use pytest fixtures for test database sessions, authenticated test clients, and sample application data
- **Test database:** Use a separate PostgreSQL test database, reset between test runs

### Frontend (Vitest)
- **Component tests:** Verify rendering of KanbanBoard, TableView, ApplicationForm, RejectionModal, Dashboard
- **Hook tests:** Test custom hooks (useApplications, useAuth) with mocked API responses
- **Interaction tests:** Test drag-and-drop status changes, form validation, filter toggling
- **Coverage goal:** 70%+ on components and hooks
- **Mocking:** Mock API service layer — never make real API calls in tests

### Chrome Extension
- **Manual testing:** Verify auto-extraction on LinkedIn, Indeed, and Handshake job listing pages
- **Automated tests:** Test the API communication functions and data parsing logic

### Testing Procedure Workflow (MUST FOLLOW)
After implementing ANY new feature, the following strict verification protocol MUST be executed before concluding the task:

1. **Static Analysis & Build Verification:**
   - Run `tsc -b` (or `npm run build` which includes it) to ensure zero TypeScript errors.
   - Run the development server (`npm run dev`) or backend server (`uvicorn`) to ensure the application starts without crashing.

2. **Automated Testing:**
   - Write unit/component tests for the new feature (matching the 70%+ frontend / 80%+ backend coverage goal).
   - Run the test suite (`npm run test` or `pytest`) to verify all new and existing tests pass.

3. **Manual Validation Context:**
   - Instead of skipping manual verification, actively use available tools (e.g., cURL, Python scripts, or the browser agent if applicable/permitted) to trigger the newly added code paths.
   - If UI components (like forms, modals, or tables) are built, verify all states:
     - **Empty state / Initial load**
     - **Validation errors** (e.g., submitting empty required fields)
     - **Successful submission/interaction**
     - **Edge cases** (e.g., duplicate detection, maximum character lengths)

4. **Documentation & Walkthrough:**
   - Document the *exact* testing steps taken (both automated and manual) in the feature's `walkthrough.md`.
   - Never mark a feature as complete until it has been explicitly validated in the runtime environment.

# ============================================================================
# 2. PRD & DESIGN REFERENCES
# ============================================================================

## PRD Document

The PRD is located at `InternTrack_PRD.docx` in the project root. It contains:
- Product overview, problem statement, and target user persona
- 19 user stories across 6 epics with acceptance criteria
- Tech stack rationale
- Release plan (Wave 1 and Wave 2)
- Technical architecture decisions

## Mockup/Prototype Designs

The interactive prototype is built as a React artifact (`InternTrack_Prototype.jsx`). Reference it for all UI decisions.

### Color Theme
- **Background:** Warm cream `#faf7f5`
- **Surface/Cards:** White `#ffffff`
- **Border:** Warm light `#f0e4df`
- **Primary (brand):** Coral `#e8604c` — used for buttons, active nav, brand accents
- **Primary Light:** `#fef0ed` — used for highlights, badges, hover backgrounds
- **Text:** Dark warm brown `#2d1f1a`
- **Text Muted:** `#917b71`
- **Status colors:**
  - Saved: `#94a3b8` (gray)
  - Applied: `#3b82f6` (blue)
  - Phone Screen: `#8b5cf6` (purple)
  - Interview: `#f97316` (orange)
  - Offer: `#22c55e` (green)
  - Rejected: `#ef4444` (red)

### Key UI Components and Expected Behavior

**Navigation Bar**
- Fixed top bar with white background, subtle bottom border and shadow
- Left: InternTrack logo/wordmark in coral, then nav tabs (Board, Table, Dashboard)
- Right: Type filter (segmented control: All | Internship | Full-time), season dropdown, "+ Add Application" button (coral), user avatar
- Active tab highlighted with coral background and white text

**Kanban Board (default view — BoardPage)**
- Six columns: Saved, Applied, Phone Screen, Interview, Offer, Rejected
- Each column has a header with colored dot, label, and count badge
- Cards show: company name (bold), role title (muted), tags (season badge in blue tint, rolling badge in orange tint, deadline in yellow tint, full-time badge in purple tint), date applied
- Cards have white background, subtle border, soft shadow on hover
- Drag-and-drop: cards can be moved between any columns. Moving to Rejected triggers the reflection modal.

**Table View (toggle from Board)**
- Ant Design Table component with columns: Company, Role, Status, Type, Season, Date Applied, Deadline
- All columns sortable (click header to toggle asc/desc)
- Status displayed as colored pill badge
- Row click opens application edit form
- Hover highlights row with warm tint

**Application Form (modal)**
- Opens on "+ Add Application" click or card/row click
- Two modes: Create and Edit (pre-fills data in edit mode)
- Fields: Company Name (required), Role Title (required), URL, Location, Salary/Pay, Date Applied, Status dropdown
- Internship Details section (visually grouped with light coral background): Type toggle (Internship/Full-time, default Internship), Season selector, Deadline date picker, Rolling deadline checkbox
- Notes textarea at bottom
- Cancel and Save/Add buttons in footer

**Rejection Reflection Modal**
- Triggered when application moves to Rejected status
- Title: "Rejection Reflection" with company and role context
- Dropdown: "What happened?" with predefined categories (No Response, Rejected After Application, Failed Phone Screen, Failed Technical Interview, Failed Final Round, Ghosted After Interview, Other)
- Textarea: "What did you learn?" (500+ characters supported)
- Both fields optional — user can skip
- Skip and Save Reflection buttons

**Duplicate Detection Modal**
- Triggered before saving when a potential duplicate is found
- Warning icon with yellow-tinted border
- Shows existing entry details (company, role, status, date)
- Three buttons: Cancel, View Existing, Save Anyway

**Dashboard**
- Top row: four stat cards (Total Applications, Applied, Response Rate %, Offers) — each with muted label and large colored number
- Middle row: two panels side by side
  - Pipeline Summary: horizontal bar chart showing count per status with colored bars
  - Rejection Insights: bar chart of rejection reason distribution (only appears after 3+ rejections logged; otherwise shows encouraging empty state message)
- Bottom: "This Week — Upcoming Deadlines" list sorted by date

**Chrome Extension Popup**
- 300px wide popup with InternTrack branding
- Auto-filled fields: Job Title, Company, URL (from current page)
- Editable fields before save
- Status dropdown (Saved/Applied), Type toggle, Deadline picker
- "Save to InternTrack" button
- Must show login prompt if user is not authenticated

## User Flows

**Flow 1: Add application from web app**
1. User clicks "+ Add Application" in nav
2. Modal opens with empty form, type defaults to Internship
3. User fills in company name, role, and optional fields
4. On save: system checks for duplicates → if found, show duplicate modal → user chooses action
5. Application appears on Kanban board in the selected status column

**Flow 2: Add application from Chrome extension**
1. User is on a job listing page (LinkedIn/Indeed/Handshake)
2. User clicks InternTrack extension icon
3. Popup auto-fills job title, company, and URL from page
4. User selects status, type, and optional deadline
5. On save: duplicate check → API call → confirmation with link to board

**Flow 3: Move application to Rejected**
1. User drags card to Rejected column (or manually changes status)
2. Rejection reflection modal appears
3. User optionally selects a reason and writes a reflection
4. Application moves to Rejected with reason and reflection saved

**Flow 4: View dashboard**
1. User navigates to Dashboard tab
2. Dashboard loads with stats, pipeline chart, rejection insights, and upcoming deadlines
3. User can filter by type (segmented control) and season (dropdown)
4. All metrics update based on active filters

# ============================================================================
# 3. SCRUM & WORKFLOW INSTRUCTIONS
# ============================================================================

## Branch Naming Convention

Format: `<type>/<issue-number>-<short-description>`

Examples:
- `feature/5-kanban-board`
- `feature/9-chrome-extension`
- `fix/7-duplicate-detection-case-sensitivity`
- `chore/1-project-scaffolding`

Types: `feature`, `fix`, `chore`, `docs`, `test`

## Commit Message Format

Format: `<type>(scope): <short description> (#<issue-number>)`

Examples:
- `feat(backend): add application CRUD endpoints (#3)`
- `feat(frontend): build Kanban board with dnd-kit (#5)`
- `fix(backend): make duplicate check case-insensitive (#7)`
- `chore(infra): set up project scaffolding (#1)`
- `test(backend): add auth flow integration tests (#2)`
- `docs: update README with setup instructions (#1)`

Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`

Scopes: `frontend`, `backend`, `extension`, `infra`

Rules:
- Subject line max 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Always reference the GitHub Issue number
- Body is optional but encouraged for complex changes

## PR Workflow

1. Create a branch from `main` using the naming convention above
2. Implement the feature/fix, commit with proper format
3. Push branch and open a Pull Request
4. PR title format: `[#<issue>] <description>` (e.g., `[#5] Build Kanban board with drag-and-drop`)
5. PR description must include:
   - `Closes #<issue-number>` to auto-link and auto-close the issue
   - Summary of what was implemented
   - Screenshots for any UI changes
   - Testing notes (what was tested and how)
6. At least one teammate must review and approve before merging
7. Merge with squash merge to keep history clean
8. Delete the branch after merge

## Referencing GitHub Issues

- In commit messages: `(#<number>)` at the end
- In PR descriptions: `Closes #<number>` or `Fixes #<number>`
- In code comments (sparingly, only for complex workarounds): `// See #<number> for context`
- On the project board: after merging, move the issue to the Done column

# ============================================================================
# 4. DO'S AND DON'TS
# ============================================================================

## Patterns to Follow

- DO use Ant Design components (Button, Table, Modal, Form, Select, DatePicker, Card, Input, Badge) for all UI elements — do not build custom replacements
- DO use dnd-kit for all drag-and-drop — it is accessible and well-maintained
- DO use Pydantic models for ALL API request validation and response serialization
- DO use FastAPI's dependency injection (`Depends()`) for auth and database sessions
- DO use SQLAlchemy 2.0 style (select statements, not legacy Query API)
- DO use Alembic for every database schema change — never modify the database manually
- DO return proper HTTP status codes: 201 for creation, 200 for success, 400 for validation errors, 401 for unauthorized, 404 for not found
- DO validate all user input on both frontend (form validation) and backend (Pydantic)
- DO use TypeScript `interface` or `type` for all data shapes
- DO keep components small and focused — extract sub-components when a file exceeds 150 lines
- DO use React hooks for state and side effects — no class components
- DO provide loading states and error states for all async operations

## Patterns to Avoid

- DO NOT use Redux or any heavy state management library — React Context + hooks is sufficient for this project
- DO NOT use `any` type in TypeScript — always define explicit types
- DO NOT store JWT tokens in localStorage for production (use httpOnly cookies); localStorage is acceptable for MVP/development
- DO NOT use the legacy SQLAlchemy Query API (e.g., `session.query(...)`) — use 2.0 style `select()`
- DO NOT write raw SQL — always go through SQLAlchemy ORM
- DO NOT create API endpoints without corresponding Pydantic schemas
- DO NOT put business logic in routers — routers handle HTTP, services handle logic
- DO NOT use `useEffect` for data that can be fetched on component mount with a custom hook
- DO NOT hardcode colors — reference the color theme constants defined above
- DO NOT use inline styles in production code — the prototype uses inline styles for convenience, but production should use Ant Design's styling system
- DO NOT commit `.env` files, database credentials, or JWT secrets to the repository
- DO NOT skip error handling — every API call in the frontend must handle loading, success, and error states

## Dependencies and Libraries to Prefer

### Frontend
- `antd` — UI components (Table, Modal, Form, Select, DatePicker, Button, Badge, Card, Layout, Menu)
- `@dnd-kit/core` and `@dnd-kit/sortable` — Kanban drag-and-drop
- `axios` — HTTP client for API calls (prefer over fetch for interceptors and error handling)
- `react-router-dom` — client-side routing
- `dayjs` — date formatting (already included with Ant Design, do not add moment.js)
- `recharts` — dashboard charts (lightweight, React-native)

### Backend
- `fastapi` — web framework
- `uvicorn` — ASGI server
- `sqlalchemy` — ORM
- `alembic` — migrations
- `pydantic` — data validation
- `python-jose[cryptography]` — JWT handling
- `passlib[bcrypt]` — password hashing
- `python-dotenv` — environment variable loading
- `asyncpg` — async PostgreSQL driver
- `pytest` — testing
- `httpx` — async test client for FastAPI

### DO NOT add these dependencies:
- `moment.js` — use dayjs instead (smaller, already in Ant Design)
- `redux` or `zustand` or `mobx` — not needed for this project scope
- `styled-components` or `emotion` — use Ant Design styling
- `express` or any Node.js backend framework — backend is Python/FastAPI
- `mongoose` or any MongoDB driver — database is PostgreSQL
- Any AI/LLM API libraries — no AI features in this project

## Security Requirements

- Passwords must be hashed with bcrypt before storing — never store plaintext
- JWT tokens must have an expiration time (access: 30 minutes, refresh: 7 days)
- All API endpoints except `/api/v1/auth/register` and `/api/v1/auth/login` must require authentication
- Users can only access their own data — every query must filter by the authenticated user's ID
- Input sanitization: Pydantic handles validation; additionally, escape any user input rendered in HTML
- CORS must be configured to only allow the frontend origin
- Environment variables (DB credentials, JWT secret) loaded from `.env` — never hardcoded

## Accessibility Requirements

- All interactive elements must be keyboard accessible
- Use Ant Design components which include ARIA attributes by default
- Kanban board must support keyboard navigation (dnd-kit provides this)
- Color is never the only indicator of meaning — always pair with text labels or icons
- Form inputs must have associated labels
- Modals must trap focus and be dismissible with Escape key
- Minimum color contrast ratio of 4.5:1 for text
