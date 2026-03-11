# Technical Blog Post: Architecting InternTrack's Analytics and Workflow Engines

*(Note: This is a draft for your section of the 1500-word team blog post, focusing specifically on your contributions from Issues 9-16 during Sprints 1 & 2).*

---

## Introduction: Turning Data into Decisions
When applying to hundreds of internships, the process quickly devolves into spreadsheet chaos. As part of the InternTrack engineering team, my primary objective was to transition our platform from a simple data-entry tool into a proactive, analytics-driven assistant. Over Sprints 1 and 2, I spearheaded the development of our analytics dashboard, advanced Kanban workflow enhancements, and a Chrome Extension to bridge the gap between job boards and our database. 

## Capturing Data at the Source: The Chrome Extension
*(Issue #9)*
The biggest friction point in tracking applications is context switching. To solve this, I built a Chrome extension that natively integrates with our Next.js backend. Using Chrome's `tabs` and `runtime` APIs, the extension scrapes metadata from platforms like LinkedIn and standard Workday portals, allowing users to save job opportunities directly to their InternTrack "Saved" column with a single click. This required setting up secure cross-origin resource sharing (CORS) and authenticating requests seamlessly using our existing JWT infrastructure.

## Maturing the Kanban Board 
While dragging and dropping cards is visually satisfying, a professional tracker needs actionability. I injected three critical features into our Kanban architecture:

1. **Deadline Urgency Indicators (Issue #12):** I modified the Kanban cards to dynamically calculate the time delta between exactly now and the application deadline. Cards visually shift colors (e.g., turning warning red for 'Apply Soon') based on upcoming deadlines, enforcing a sense of urgency for "Rolling" applications.
2. **Follow-up Reminders (Issue #11):** Getting an offer often relies heavily on networking. I implemented an inline, inline-editing reminder system directly on the application cards. This utilized React state to instantly toggle a native date-picker, updating PostgreSQL via a Prisma PUT request while optimistically updating the UI.
3. **Rejection Reflection (Issue #10):** The most painful part of the hunt is the rejection. I hijacked the DnD (`dnd-kit`) drop context. Now, when a user drops a card into the "Rejected" column, React intercepts the API call and mounts a Reflection Modal. This prompts the user to document *why* they think they were rejected (e.g., "Failed technical screen", "Moved pipeline too late"), turning failure into structured, queryable data.

## The Analytics Dashboard: A Pulse on the Pipeline
*(Issues #13, #15, #14, #16)*
With structured application data flowing in, the next logical step was visualization. I built the `Dashboard` as the new default landing page for authenticated users. 

**Pipeline Metrics & Recharts Integration**
I utilized `Recharts` to build the **Rejection Insights Chart**. By aggregating the "Rejection Reflection" data, the dashboard dynamically renders a bar chart showing the distribution of rejection reasons—but only if the user has accumulated at least three rejections to avoid skewed, panic-inducing data. 

Above this, I implemented a **Pipeline Summary Bar**. Instead of heavy third-party libraries for a simple stacked bar, I dynamically calculated CSS flex-widths using TailwindCSS based on the fraction of total applications in each status (`Saved`, `Applied`, `Interviewing`, etc.). This provided a lightweight, highly performant visual summary. I also engineered a real-time **Response Rate** calculator, exposing a crucial metric: `(Phone Screens + Interviews + Offers) / (Total Applications - Saved)`.

**Unified Global Filtering**
To make the analytics truly useful, everything had to be sliceable. I built a global filter system (`Type`: Internship vs. Full-time, and `Season`: Summer 2026, Fall 2026). Elevating the filter state to the top-level `page.tsx` React component allowed me to pass down a `filteredApps` array to all child components. Whether the user is looking at the Rejection Chart, the This Week agenda, or the Pipeline Bar, the interface instantly reacts to their filter criteria without redundant API calls.

## AI Integration and Developer Velocity
Building tightly coupled UI features and robust backend routes in a short sprint is demanding. Throughout this process, I leveraged **Workspace-aware AI (IDE-centric)** to accelerate development. Instead of manually writing 60+ lines of Vitest boilerplate to simulate a user clicking open a date picker, modifying a date, and clicking save, I offloaded test generation to the AI. This allowed us to hit our strict **>80% test coverage** requirement rapidly, leaving me more time to focus on complex state management and the UX/UI micro-interactions (like the smooth hover states on the Dashboard filter pills). 

By combining Chrome Extensions, React's reactive state paradigm, and data visualization, we transformed InternTrack from a basic CRUD app into an actionable command center for job seekers.
