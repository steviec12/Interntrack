# Sprint 1 Retrospective: Core Architecture & Kanban

**Date:** March 2, 2026
**Sprint Goal:** Establish the foundational Next.js architecture, secure backend authentication, and implement the core Drag-and-Drop Kanban board.

## What Went Well
1. **Architecture Setup:** We successfully initialized the Next.js App Router and integrated TailwindCSS without major conflicts. The decision to use Ant Design for the table layout saved significant development time.
2. **Authentication Flow:** Implementing NextAuth.js with a Credentials provider backed by Prisma and PostgreSQL went smoother than expected. We successfully secured the `/api/v1/applications` routes on the first try, ensuring user data privacy.
3. **Drafting the Chrome Extension:** The initial scoping for the Chrome Extension (Epic 5) was completed, and we successfully validated that we could inject a content script into LinkedIn.

## What Could Be Improved
1. **Database Migrations:** We ran into issues with Prisma 7's edge compatibility requiring the explicit `@prisma/adapter-pg` driver. This delayed the deployment pipeline setup by a day.
2. **Drag & Drop Complexity:** Implementing `@dnd-kit` was surprisingly complex regarding sensor configurations. Click events on the cards were initially competing with drag events, causing a frustrating UX where users couldn't click to edit an application without accidentally moving it.

## Action Items for Sprint 2
1. Extricate the sensor logic in the Kanban board to strictly require a 5px drag distance before intercepting the click event.
2. Begin Epic 6 (Dashboard Analytics) now that the core data model is stable.
3. Set up automated Vitest coverage reporting in GitHub Actions to ensure we don't regress on our >80% coverage goal while building the UI layer.
