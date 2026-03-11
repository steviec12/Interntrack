# InternTrack 🚀

**InternTrack** is a modern, full-stack application designed to streamline and demystify the internship and full-time job search process. Built with a robust tech stack, it provides students with an intuitive Kanban board and an insightful analytics dashboard to manage applications from the first send to the final offer.

---

## 🌟 Key Features

### 1. **Secure User Authentication**
- JWT-based authentication powered by **Auth.js** (NextAuth.js).
- Secure password hashing using **bcryptjs**.
- Each user gets their own sandboxed data space—your applications are completely private.

### 2. **Interactive Kanban Board**
- **Drag & Drop Status Updates**: Fluidly move applications between "Saved", "Applied", "Phone Screen", "Interviewing", "Offer", and "Rejected" columns using `@dnd-kit`.
- **Automated Timestamps**: Status updates immediately sync with the PostgreSQL database.
- **Deadlines & Reminders**: Set actionable countdowns and reminders for application actions right on the cards.

### 3. **Smart Analytics Dashboard**
- **Pipeline Metrics**: At-a-glance visualization of your entire application pipeline directly upon login.
- **Calculate Response Rate**: Calculates quantitative response tracking using the formula: `(Phone Screen + Interview + Offer) / (Total - Saved)`.
- **Rejection Insights**: Intelligent stacked bar charts charting reasons for rejection (rendered with Recharts) to help identify patterns in the job hunt.
- **Global Filters**: Dynamically filter all metrics, charts, and upcoming tasks by "Internship", "Full-time", or specific hiring seasons.

### 4. **Chrome Auto-Capture Extension**
- **Seamless Data Entry**: Pre-fills application data directly from LinkedIn and other job portals.
- **Background Syncing**: Instantly saves captured job postings directly to your active Kanban board.

### 5. **Public REST API**
- Extensive, documented `/api/v1/` RESTful JSON backend natively built within Next.js API Routes.
- Full CRUD operations with internal Zod validation schemas.
- Documented heavily in `API_DOCS.md`.

---

## 🛠 Tech Stack

**Frontend**
- **Framework**: Next.js 15 (App Router) / React 19
- **Styling**: TailwindCSS 4, Ant Design components
- **Charting & Interactions**: Recharts (Data Visualization), Dnd-kit (Drag & Drop)

**Backend & Database**
- **Runtime**: Node.js via Vercel Edge / Next.js Serverless functions
- **Database**: PostgreSQL (hosted via Supabase/Neon)
- **ORM**: Prisma (with native Neon Serverless Driver adapters)
- **Validation**: Zod schema parsing

**DevOps & Evaluation**
- **Testing**: Vitest, React Testing Library (currently > 80% coverage on tests)
- **CI/CD**: GitHub Actions (Automated Linting and Vitest Coverage Pipelines configured and passing)

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** v20+
- **npm** or **pnpm**
- A **PostgreSQL** database (Local or Cloud like Neon/Supabase)

### 2. Environment Variables
Create a `.env` file in the root directory and ensure the following variables are defined:
```env
# Database Connections
DATABASE_URL="postgresql://user:password@host:port/interntrack_db?schema=public"

# Auth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_random_32_char_base64_string_here"
```

### 3. Installation & Database Sync

```bash
# Install NPM dependencies
npm install

# Push Prisma schema to the newly created PostgreSQL database
npx prisma db push

# (Optional) Generate the Prisma Client locally
npx prisma generate
```

### 4. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🧪 Testing and Coverage

We utilize `Vitest` for lightning-fast unit and integration testing. We test our frontend components (rendering, interactivity) and our backend API routes (authentication, persistence layers).

```bash
# Run all tests
npm test

# Run tests and generate full Coverage Report
npm run coverage
```
*Current test coverage strictly exceeds the 80% requirement to ensure technical excellence.*

---

## 📚 API Documentation

For third-party integration or architectural review, our backend routes are fully documented. 
Please refer to the **[`API_DOCS.md`](./API_DOCS.md)** file in the repository root for request payloads, authentication requirements, and endpoint layouts.

---

## 🤝 Agile Development
This project was built following the Agile Scrum methodology:
- Progress has been meticulously tracked utilizing **GitHub Issues**.
- Work executed across documented feature Sprints.
- Each core feature is associated with a specific PR representing isolated scopes of work.

---
*Built for CS 7180 Project 2.*
