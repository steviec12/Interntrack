# AI Usage Log

This document records the AI-assisted workflows used during development and final hardening of InternTrack. It is written to support the Project 2 rubric by mapping each modality to concrete tasks, repo artifacts, and manual verification steps.

## Working Rule

AI was used to accelerate planning, scaffolding, debugging, and testing. Final responsibility still stayed with the engineering team: all code, docs, tests, and deployment fixes were reviewed manually before merge.

## Modality 1: Claude Web for planning and design review

Claude Web was most useful before code was written or when a feature needed high-level decomposition.

Representative uses:

- Breaking the assignment requirements into backend, frontend, testing, and documentation workstreams
- Pressure-testing the Next.js migration plan before moving away from the older prototype structure
- Reviewing authentication-flow tradeoffs for Auth.js credentials login, protected routes, and safer user-facing error messages
- Thinking through what fields the application form and schema needed to support later analytics and workflow features
- Framing the duplicate-detection UX so the feature blocked accidental duplicates without blocking intentional user action

Why this modality fit:

- It was best for brainstorming, outlining, and comparing implementation options before touching the repo
- It helped reduce blind spots in scope planning for a time-boxed class project

Human verification:

- Design suggestions were only accepted after matching them against the PRD, UI spec, and the actual repo code
- Final implementation details were validated in code review and by running the application locally

## Modality 2: IDE-centric AI for workspace-aware implementation

IDE-centric AI was used while actively editing the codebase because it could see nearby files, imported types, and naming conventions.

Representative issue mapping:

### Issues `#1` and `#2`

- Assisted with moving the project into a Next.js App Router structure
- Helped wire shared layout files, page files, and component placement in the new app
- Accelerated Auth.js and Prisma integration work by drafting code around the existing repo context
- Helped tighten `src/lib/auth.ts` so raw backend details were not exposed to end users

### Issues `#3` and `#4`

- Drafted Prisma model changes and Zod validation schemas
- Generated secure CRUD route scaffolds in `src/app/api/v1/applications`
- Helped build the `applicationService` layer used by the frontend
- Accelerated form-field expansion in `src/components/Forms/ApplicationForm.tsx`
- Assisted with login and register page test generation

### Issues `#5` through `#8`

- Generated and refined Vitest mocks for board components
- Helped implement `ApplicationTable` and its tests
- Accelerated work on the duplicate-check route and warning modal
- Helped harden card-level component behavior and related tests

Why this modality fit:

- It was strongest when the task depended on existing imports, project structure, or nearby test files
- It reduced time spent on repetitive scaffolding so the team could focus on architecture and UX decisions

Human verification:

- All generated code was read and edited before merge
- New tests were run locally
- Auth-protected routes were checked manually for `401`, `403`, and `404` behavior
- Feature branches were reviewed through pull requests before landing on `main`

## Modality 3: Terminal-based AI pair programming for final hardening

Terminal-based AI was used during deployment debugging, branch cleanup, type/test hardening, and final submission packaging.

Representative tasks:

- Diagnosed the Vercel build failure caused by missing Prisma client generation and added `postinstall: prisma generate`
- Fixed the guest-homepage fetch issue so unauthenticated visitors no longer triggered a protected applications request
- Cleaned up route tests when the Next.js dynamic route context changed to `params: Promise<{ id: string }>`
- Removed unsafe `any` usage from the homepage state/update flow and validated the cleanup with `tsc`, `vitest`, and `eslint`
- Reconciled API documentation with the actual schema and route implementations
- Produced the missing sprint-planning, AI-usage, user-story, and blog-post deliverables for submission

Why this modality fit:

- It was efficient for repo-local debugging and targeted changes that required running commands, reading files, and validating results quickly
- It was especially useful late in the project when the remaining work mixed code, tests, deployment, and documentation

Human verification:

- Deployment fixes were confirmed through Vercel redeploys
- Type and test cleanups were validated locally before push
- Documentation updates were cross-checked against the live repo state

## Evidence By Issue

- Issue `#1`: Next.js migration and scaffolding in `src/app`, `src/components`, and project config files
- Issue `#2`: authentication hardening in `src/lib/auth.ts` and auth-related package updates
- Issue `#3`: Prisma schema, Zod validation, CRUD routes, and route tests
- Issue `#4`: expanded form flow, auth pages, and page integration work
- Issue `#5`: board-component tests and coverage uplift
- Issue `#6`: `ApplicationTable` and its related tests
- Issue `#7`: `check-duplicate` API route, warning modal, and tests
- Issue `#8`: board-card refinements and strengthened tests
- Final hardening: deployment, auth-fetch, type cleanup, and documentation branches completed after the core feature work

## Summary

InternTrack did not use AI as a black box. The team used different AI modalities for different kinds of work:

- Claude Web for planning and design review
- IDE-centric AI for context-aware implementation
- Terminal-based AI pair programming for debugging, validation, and final hardening

That separation of responsibilities made the AI usage easier to defend technically because each modality was applied where it was actually strongest.
