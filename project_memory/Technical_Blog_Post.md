# Technical Blog Post: Building InternTrack from Full-Stack Foundation to Workflow Intelligence

## Introduction

Internship tracking sounds simple until the process becomes real. A student usually starts with a spreadsheet, a notes app, or a rough to-do list. That works for ten applications, but it breaks down when deadlines, multiple interview stages, rejection patterns, and follow-up reminders start piling up at the same time. Our goal with InternTrack was to replace that fragile workflow with a real full-stack application: one place where a user could authenticate securely, manage applications in PostgreSQL, move through a visual pipeline, and later analyze patterns in the search itself.

This project was built as a team effort, but my primary ownership covered Issues `#1` through `#8`. That meant I was responsible for turning the project into a deployable Next.js application, designing the secure backend foundation, expanding the core data flow, strengthening test coverage, and shipping the features that made the base tracker usable before the analytics-heavy work arrived. In practice, that foundational work mattered because every later feature depended on it. The dashboard, reminders, rejection insights, and Chrome extension all needed a stable data model, secure user isolation, and a reliable UI surface first.

## From Prototype to Production-Ready Next.js

The first major step was architectural. The project began from a more limited frontend structure, which was not enough for the assignment's full-stack requirements. Issue `#1` migrated the codebase into a Next.js App Router project so frontend pages, backend routes, and deployment concerns could live in one coherent application. This was not just a framework preference. It simplified the mental model of the system: UI pages, API routes, shared types, and server code all lived in the same repo, which made both iteration and testing faster.

That migration also forced us to define the project skeleton early. TailwindCSS, TypeScript, ESLint, page layout, and navigation all had to be re-established in the new environment. I ported the form and the initial homepage into the new structure, giving the team a working base that could be extended instead of rewritten over and over. In a class project with a tight deadline, removing structural uncertainty early is one of the biggest productivity gains you can buy.

## Secure Authentication and User Isolation

A tracker is useless if users cannot trust the privacy of their data. Issue `#2` focused on secure authentication using Auth.js with a credentials-based flow backed by Prisma. The core requirement was straightforward: users must be able to register, log in, and access only their own records. The engineering challenge was in the edges. Passwords had to be hashed securely, sessions had to be available server-side for API protection, and error handling had to stay user-safe.

One of the concrete fixes in this stage was preventing raw authentication errors from leaking back to the browser. That kind of leak is easy to overlook in a student project, but it matters because it exposes implementation details and creates a sloppy user experience. Tightening the auth layer early gave us a dependable rule for the rest of the app: anything under `/api/v1/applications` is private and must be backed by a verified session. Later features could then assume user identity and ownership were already enforced consistently.

## Designing the Application Model and CRUD API

With the framework and auth foundation in place, Issue `#3` moved into the heart of the product: the application data model and the CRUD API. This meant defining a Prisma schema that could support real use cases instead of just a toy demo. An application was not only a company name and role title. It also needed status, type, season, URL, location, salary range, notes, deadlines, and later fields such as reminders and rejection metadata.

I paired the Prisma model with Zod validation schemas so the backend could reject invalid input before it ever touched the database. That decision mattered because it kept the API contract explicit. The create and update routes were not just "accept any JSON and hope for the best"; they had a defined set of accepted fields and types. The routes under `/api/v1/applications` and `/api/v1/applications/:id` enforced three important boundaries:

- the request must come from an authenticated user
- the requested record must exist
- the record must belong to that same user

That combination turned a simple REST API into a secure multi-user backend. It also gave us cleaner tests. Once those route contracts existed, I added integration tests covering success, validation failures, unauthorized requests, and forbidden access. Those tests became a safety net for later UI work because the frontend could trust the backend behavior instead of re-implementing business rules in the browser.

## Making the Form and Homepage Actually Useful

Issue `#4` connected the backend foundation to the everyday user experience. A tracker only becomes real when the form captures the fields users actually care about and when the homepage can fetch, render, and update records in context. I expanded the form so it could handle the richer application schema and wired the page-level logic to the new service layer. That work made the app feel less like a demo and more like a product.

This stage also included the supporting auth pages and their tests. Login and registration were no longer abstract backend capabilities; they had an actual place in the user flow. The homepage could now load application data for an authenticated user, display it in the main workspace, and set up the shared state that later features would reuse. This was important not only for functionality, but also for future composition. Once the page owned a reliable application dataset, it became much easier for later work to add alternate views, filters, analytics widgets, and interaction-specific overlays.

## Raising the Engineering Bar with Tests

Issue `#5` focused on technical excellence rather than flashy new UI. The project rubric required strong automated testing, and the fastest way to lose control of a React codebase is to keep shipping UI interactions without a test harness. I used this sprint to raise coverage around the board components, especially `ApplicationCard` and `BoardColumn`. These are deceptively important components because they sit in the center of the workflow. If they break, the app still compiles, but the experience becomes unreliable immediately.

Adding tests here did two things. First, it improved raw coverage numbers. Second, and more importantly, it gave the team permission to keep iterating on the board without fear of silent regressions. That matters in a sprint-driven class project, where features are added quickly and different teammates are touching the same page. Good coverage is not just a rubric checkbox. It is a coordination tool.

## Supporting Different Ways to Scan the Same Data

Issue `#6` introduced `ApplicationTable`, which seems like a small feature but was important from a product-design perspective. Not every user wants to think in Kanban mode all the time. A board is great for workflow movement, but a table is often better when the task is scanning, sorting mentally, or reviewing many applications at once. Adding the table view meant the same underlying dataset could support different cognitive styles without creating a separate feature silo.

Technically, the interesting part was keeping the board and table tied to the same source of truth. The table should not require a second API or a duplicated state model. Instead, it should be another projection of the same application list the page already owns. That decision kept the architecture simpler and reduced the chance that one view would drift from the other.

## Preventing Bad Data Before It Spreads

Issue `#7` added one of the most practical workflow protections in the app: duplicate detection. Internship applications are repetitive by nature, especially when users jump between job boards, referrals, and saved links. It is surprisingly easy to create the same entry twice and then lose trust in the tracker. I addressed that by adding a duplicate-check endpoint plus a warning modal in the form flow.

The backend route checks whether the authenticated user already has an application with the same company and role title. The frontend uses that response to warn the user before saving a probable duplicate. I intentionally framed this as a warning instead of a hard block. That preserved user control while still keeping the data cleaner by default. Just as important, the feature came with tests at both the route and component layers, which made it more than a one-off UX trick.

## Polishing the Board Surface

Issue `#8` focused on board-card polish and reliability. By this point, the app already had the major structural pieces, but a tracker still rises or falls on how usable its main screen feels. Application cards needed to show the right metadata, support the intended interactions, and behave consistently under test. This work was less about introducing a brand-new concept and more about making the existing experience trustworthy.

That distinction is important. Many student projects over-index on adding net-new features while leaving the core interactions rough. I treated the board surface as a product-quality concern. A slightly more polished card, plus stronger tests around that card, gives users confidence every time they touch the app. It also creates a better foundation for teammate work that later layered on reminders, rejection reflections, urgency badges, and analytics based on those same application records.

## How the Rest of the Product Built on That Foundation

After Issues `#1` through `#8` established the platform core, the second half of the project expanded InternTrack into a more intelligent workflow system. The teammate-owned Issues `#9` through `#16` built the Chrome extension, rejection-reflection flow, reminder system, urgency indicators, and analytics dashboard. That later work added major user value, but it was only possible because the app already had secure user isolation, a stable schema, tested API routes, and a homepage state model capable of supporting richer interactions.

In that sense, the most important contribution of the first eight issues was leverage. They made future features cheaper to build and safer to validate. Good foundations do not always look flashy in a demo, but they determine whether the second half of a project becomes an extension of the product or a patchwork of exceptions.

## AI-Assisted Engineering and Lessons Learned

AI also played a meaningful role in development, especially for high-speed planning, test generation, and repo-local debugging. Claude Web was most useful for decomposing requirements and stress-testing feature plans before implementation. IDE-centric AI was most useful when editing workspace-aware code such as route handlers, Prisma-backed logic, and Vitest mocks. Terminal-based AI pair programming was especially helpful during final hardening, including deployment debugging, type cleanup, and documentation alignment.

The biggest lesson from the project was that engineering quality compounds. Secure auth, a real schema, a validated API contract, and automated tests do not just satisfy a rubric. They reduce the cost of every later feature. InternTrack ultimately became more than a CRUD app because the early work treated architecture, ownership boundaries, and reliability as first-class concerns. That is what made the later analytics and workflow features credible instead of ornamental.
