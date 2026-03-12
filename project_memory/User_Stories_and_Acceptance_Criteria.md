# User Stories and Acceptance Criteria

This document captures the user stories and acceptance criteria for the Issues `#1` through `#8` workstream.

## Issue `#1`: Next.js migration and scaffolding

### User story

As a developer, I want the project migrated into a single Next.js codebase so the team can build, test, and deploy one integrated full-stack application.

### Acceptance criteria

- The repository uses Next.js App Router as the primary application structure.
- TailwindCSS, TypeScript, and ESLint are configured and working in the new codebase.
- The old frontend-only structure is retired from the active app path.
- The root layout, homepage, and shared navigation render successfully.
- The existing application form is ported into the new structure without losing baseline functionality.

## Issue `#2`: Secure authentication

### User story

As a user, I want secure registration and login so my internship data is private and only I can access it.

### Acceptance criteria

- Users can register with an email and password.
- Passwords are hashed before being stored in the database.
- Users can sign in using the credentials flow.
- Unauthorized requests to protected routes return `401 Unauthorized`.
- Internal authentication failures do not leak raw backend errors to the browser.

## Issue `#3`: Application CRUD API

### User story

As an authenticated user, I want to create, read, update, and delete applications so I can manage my job-search pipeline in one place.

### Acceptance criteria

- A Prisma application model exists and is stored in PostgreSQL.
- `POST /api/v1/applications` creates an application for the authenticated user.
- `GET /api/v1/applications` returns only the authenticated user's applications.
- `GET`, `PUT`, and `DELETE /api/v1/applications/:id` respect authentication and ownership.
- Request payloads are validated with Zod.
- Tests cover success, validation failure, unauthorized access, and forbidden access.

## Issue `#4`: Expanded form and page integration

### User story

As a user, I want a richer application form and connected pages so I can track more than just a company name and title.

### Acceptance criteria

- The form captures required fields such as company and role title.
- The form also supports optional fields needed for real tracking, such as season, location, URL, rolling deadlines, and notes.
- Login and register pages are available in the app.
- The homepage fetches application data from the backend for authenticated users.
- The page-level state updates when applications are created or changed.

## Issue `#5`: Test coverage uplift

### User story

As a team, we want meaningful test coverage so we can refactor the board and API logic with confidence.

### Acceptance criteria

- Core board components have automated tests.
- Tests cover component rendering and key interaction behavior.
- Coverage reporting improves relative to the earlier project state.
- The codebase can run automated tests in CI.

## Issue `#6`: Table view

### User story

As a user, I want a table view in addition to the Kanban board so I can scan all of my applications quickly.

### Acceptance criteria

- A table component exists and renders the application dataset.
- The table shows key fields such as company, role, status, and type.
- The table view can coexist with the board view without requiring a separate data source.
- Tests cover table rendering behavior.

## Issue `#7`: Duplicate detection

### User story

As a user, I want to be warned about duplicates before saving an application so my tracker stays clean and trustworthy.

### Acceptance criteria

- The API exposes a duplicate-check endpoint for authenticated users.
- Duplicate checking compares `companyName` and `roleTitle` within the current user's own data.
- The form surfaces a warning modal when a duplicate is detected.
- Users can back out or intentionally continue after the warning.
- Tests cover duplicate and non-duplicate server responses and modal behavior.

## Issue `#8`: Board-card polish and reliability

### User story

As a user, I want board cards to display useful metadata and behave consistently so the board remains my main workflow surface.

### Acceptance criteria

- Application cards display the key job and status details needed for quick review.
- Card interactions remain consistent with the intended board UX.
- Related component tests are updated to reflect the refined behavior.
- Duplicate warning and card behavior work together without regressions.

## Traceability Summary

- Issue `#1` -> PR `#17`
- Issue `#2` -> PR `#19`
- Issue `#3` -> PR `#20`
- Issue `#4` -> PR `#21`
- Issue `#5` -> PR `#22`
- Issue `#6` -> PR `#23`
- Issue `#7` -> PR `#24`
- Issue `#8` -> PR `#25`
