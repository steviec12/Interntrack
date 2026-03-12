# Sprint 2 Planning: Quality, Workflow Expansion, and UX Hardening

## Sprint Goal

Build on the Sprint 1 foundation by improving engineering quality, expanding the application views, preventing bad data entry, and polishing the board experience.

## Primary Scope

Sprint 2 was planned around Issues `#5` through `#8`.

- Issue `#5`: expand test coverage and harden board-level component behavior
- Issue `#6`: add a table view so users are not limited to the Kanban board
- Issue `#7`: prevent duplicate application entries before they reach the database
- Issue `#8`: polish board cards and strengthen related tests

## Planned Outcomes

- Safer refactors because key board components are covered by tests
- Multiple ways to inspect the same application dataset
- Cleaner data because obvious duplicate submissions are blocked or warned about
- More reliable board interactions ahead of the later analytics and reminder features

## Sprint Backlog

### Issue `#5`: Coverage and board-component reliability

- Add Vitest coverage around core board components
- Test rendering and interaction paths for `ApplicationCard` and `BoardColumn`
- Refactor page-level state where needed to make those components easier to test

### Issue `#6`: Table view

- Create `ApplicationTable` as an alternative presentation layer
- Surface key application fields in a compact, scan-friendly format
- Make the board and table views coexist in the main experience
- Add tests for row rendering and table-specific interactions

### Issue `#7`: Duplicate detection

- Add `/api/v1/applications/check-duplicate`
- Check duplicates by `companyName` and `roleTitle` within the authenticated user's own records
- Show a warning modal before the user saves an obvious duplicate
- Add tests for both the API route and the warning modal

### Issue `#8`: Card polish and reliability

- Refine what metadata is shown on application cards
- Tighten card interactions so tests reflect the intended UX
- Expand tests around board-card behavior and related warning flows

## User Stories In Scope

- As a team, we want stronger test coverage so new features do not break the existing tracker.
- As a user, I want a table view so I can scan applications quickly without dragging cards.
- As a user, I want duplicate warnings so I do not create the same application twice by mistake.
- As a user, I want board cards to feel reliable and informative because the board is the primary workflow surface.

## Risks Identified During Planning

- Raising coverage while the UI was still changing could create brittle tests if components were not designed carefully.
- Duplicate detection could be tricky with case sensitivity and Neon/PostgreSQL adapter behavior.
- Supporting both board and table views could create duplicated state logic in the homepage.
- UX polish tasks can expand unpredictably if they are not bounded clearly.

## Mitigation Plan

- Focus tests on user-visible behavior rather than implementation details.
- Keep duplicate detection scoped to company and role, and perform the comparison in server logic.
- Reuse a shared application service layer instead of splitting board and table data flows.
- Treat card polish as incremental hardening, not a redesign.

## Definition Of Done

- New views and duplicate-check logic are merged through isolated pull requests
- Coverage increases on the highest-risk UI paths
- Duplicate detection works for authenticated users and respects user ownership boundaries
- Board and table views both render from the same underlying application data
- Manual smoke testing confirms the warning modal and updated card behavior

## Planned Demo

- Load an authenticated user's applications in both board and table formats
- Attempt to create a duplicate application and show the warning modal
- Run tests for the new board and duplicate-detection flows
- Show improved card rendering and interactions on the board

## Traceability

- PR `#22`: Issue `#5`
- PR `#23`: Issue `#6`
- PR `#24`: Issue `#7`
- PR `#25`: Issue `#8`
