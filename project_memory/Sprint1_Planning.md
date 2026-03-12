# Sprint 1 Planning: Foundation and Core Application Flow

## Sprint Goal

Turn the original prototype into a production-ready full-stack Next.js application with secure authentication, a real database model, and the first complete application-management flow.

## Primary Scope

Sprint 1 was planned around Issues `#1` through `#4`, which established the platform foundation that later teammate work depended on.

- Issue `#1`: migrate the project to Next.js App Router and initialize the new full-stack scaffold
- Issue `#2`: harden authentication with Auth.js, Prisma, and safer error handling
- Issue `#3`: design the Prisma application model and ship secure CRUD API routes
- Issue `#4`: expand the application form and wire the homepage and auth views into the new backend

## Planned Outcomes

- One integrated codebase for frontend, backend, and database logic
- User registration and login working end to end
- Protected API routes for application records
- A homepage capable of loading and displaying authenticated user data
- A form that captures enough job-search detail to support the later analytics and workflow features

## Sprint Backlog

### Issue `#1`: Scaffolding and migration

- Replace the older frontend-only structure with a Next.js App Router project
- Configure TailwindCSS, TypeScript, ESLint, and the new root layout
- Port the existing application form into the new structure
- Establish a baseline homepage and navigation shell

### Issue `#2`: Authentication

- Add Auth.js credentials-based authentication
- Connect authentication to Prisma-backed user records
- Hash passwords securely with `bcryptjs`
- Prevent raw internal authentication errors from leaking to the client

### Issue `#3`: Application CRUD API

- Create the Prisma schema and migration for the application model
- Add Zod request validation for create and update payloads
- Implement `/api/v1/applications` and `/api/v1/applications/:id`
- Protect all application routes so users can only access their own data
- Add API route tests for authenticated, unauthorized, forbidden, and validation-failure paths

### Issue `#4`: Form and page integration

- Expand the application form to handle richer metadata
- Connect the page-level React state to the new application service layer
- Add login and register pages and related tests
- Make sure the authenticated homepage can load application data from the backend

## User Stories In Scope

- As a student, I want a modern web app instead of a fragile prototype so the project can be deployed and extended.
- As a user, I want secure login and registration so my applications stay private.
- As an authenticated user, I want to create, read, update, and delete applications from a real database.
- As a user, I want the form to capture enough context about an application that the tracker is actually useful.

## Risks Identified During Planning

- The Next.js migration could break existing UI behavior while the team was still learning the App Router.
- Auth.js, Prisma, and PostgreSQL integration could slow the sprint because all three pieces had to agree on session shape and database access.
- The application schema might evolve while the form was being built, which could force rework across the API and UI.
- Deployment could be delayed by Prisma client generation or database-driver compatibility issues.

## Mitigation Plan

- Migrate incrementally and keep the form working during the framework transition.
- Define the Prisma schema and Zod validators early so the UI and API share the same field expectations.
- Add route tests as soon as CRUD endpoints exist instead of waiting until the end of the sprint.
- Keep the initial homepage simple and prioritize correctness over visual polish.

## Definition Of Done

- Feature shipped in a dedicated branch and merged through a pull request
- Build passes and core flows are manually smoke tested
- Protected routes return the correct auth and ownership errors
- Prisma schema and API validation are in sync
- Tests exist for the highest-risk logic introduced in the sprint

## Planned Demo

- Register a new user
- Sign in with that user
- Create an application through the form
- Confirm the application persists in PostgreSQL and reloads on the homepage
- Show unauthorized API behavior for non-authenticated requests

## Traceability

- PR `#17`: Issue `#1`
- PR `#19`: Issue `#2`
- PR `#20`: Issue `#3`
- PR `#21`: Issue `#4`
