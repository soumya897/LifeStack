# LifeStack — Engineering & Career OS for Software Developers

<div align="center">
  <img src="lifestack-frontend/public/favicon.svg" width="96" height="96" alt="LifeStack Logo" />
  <p align="center">
    <strong>A unified personal productivity platform and Progressive Web App (PWA) engineered for software developers.</strong><br />
    Organize curriculum roadmaps, record algorithm solutions with time/space complexity notes, manage recruitment pipelines on Kanban, schedule study blocks with synthesized audio alerts, and monitor system health through an admin console.
  </p>
  <p align="center">
    <a href="#core-pillars--capabilities">Features</a> •
    <a href="#architecture--tech-stack">Architecture</a> •
    <a href="#security--multi-tenant-isolation">Security</a> •
    <a href="#database-schema--migrations">Database</a> •
    <a href="#api-reference">API Docs</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="https://soumya-here.vercel.app">Author Portfolio</a>
  </p>
</div>

---

## 🌟 Core Pillars & Capabilities

### 1. 🗺️ Curriculum Roadmaps & Timeline Health
- **Modular Curriculums:** Break down complex computer science disciplines (DSA, System Design, Spring Boot, Distributed Systems) into sequential, structured topics.
- **Configurable Progress Engines:** Support for `TOPIC`-based, `TASK`-based, and `WEIGHTED` completion formulas with division-by-zero boundary protections.
- **Timeline Health & Overdue Tracking:** Real-time calculation of elapsed days, days remaining to deadlines, and automated overdue status badges.
- **Drag-and-Drop / Reordering:** Sequenced topic reordering with instant state persistence.

### 2. 💻 Coding Bank & Complexity Vault
- **Multi-Difficulty Categorization:** Track LeetCode, Codeforces, and HackerRank questions categorized by `EASY`, `MEDIUM`, or `HARD`.
- **Solution Archive:** Store multiple code implementations per problem (Java, Python, C++, Go, TypeScript).
- **Big-O Complexity Logs:** Explicit tracking of asymptotic time complexity (e.g., $\mathcal{O}(N \log N)$) and space complexity ($\mathcal{O}(1)$), along with approach write-ups.
- **Lifecycle Advancement:** Automatic status transition from `UNSOLVED` / `ATTEMPTED` to `SOLVED` upon saving working solutions.

### 3. 💼 Recruitment Kanban & Interview Pipeline
- **Visual Application Pipeline:** Manage job opportunities across 9 discrete stages: `SAVED`, `APPLIED`, `SCREENING`, `INTERVIEW`, `ASSESSMENT`, `OFFER`, `HIRED`, `REJECTED`, and `WITHDRAWN`.
- **Interview Event Timeline:** Record individual rounds (`PHONE_SCREEN`, `TECHNICAL`, `SYSTEM_DESIGN`, `BEHAVIORAL`, `TAKE_HOME_ASSESSMENT`) with dates, statuses, and feedback.
- **Stage Progression & History:** Automatic state transition logs with audit timestamps when interviews are scheduled or offer outcomes are recorded.
- **Attached Knowledge:** Directly link notes, resumes, or interview prep documents to specific applications.

### 4. 📝 Knowledge Notes & Bidirectional Linking
- **Markdown Notes Vault:** Draft and format technical notes with tagging and search.
- **Bidirectional Relationship Graph:** Link notes directly to curriculum topics, coding problems, and job applications without data duplication.
- **Resource Repository:** Attach external reference links, documentation URLs, and cheat sheets.

### 5. ⏰ Schedule & Synthesized Web Audio Alarms
- **Schedule Management:** Plan interview dates, study blocks, and revision sessions with priorities (`LOW`, `MEDIUM`, `HIGH`).
- **Web Audio API Engine:** Browser-native synthesized chime audio alarms that ring at trigger times without external media dependencies.
- **Live Notifications Drawer:** Interactive alert banner and acknowledgment workflow.

### 6. 📊 Engineering Analytics & Velocity Reporting
- **Learning Velocity:** Active roadmap completion percentage, topic completion velocity, and timeline metrics.
- **Career Pipeline Funnel:** Conversion rate calculations from application to interview, offer conversion percentages, and source effectiveness (LinkedIn, Referral, Direct).
- **Monthly Velocity:** 6-month historical submission trends and interview volume graphs.

### 7. 🛡️ Unified Admin Console & Operations
- **Single Unified Login:** Seamless portal routing both standard users and administrators from a single login interface without revealing admin presence.
- **Concurrent Active Sessions:** Real-time tracking of active unexpired sessions via Spring Security `SessionRegistry`.
- **Daily Active Users (DAU):** 7-day and 30-day activity trend calculations powered by persistent daily activity logs.
- **Cloud Security Telemetry:** Live verification of multi-tenant isolation, row-level boundaries, and database pool status.
- **User Moderation:** Instant account blocking/unblocking with immediate session revocation (`session.invalidate()` and `expireNow()`).
- **Account Deletion:** Self-service account deletion and administrative permanent user purge with clean foreign key cascading.

### 8. 📱 Progressive Web App (PWA)
- **Installable Desktop/Mobile App:** Native PWA manifest with standalone display mode.
- **Offline Reliability:** Service worker caching for static assets, client routing, and offline fallbacks via `vite-plugin-pwa`.

---

## 🏛️ Architecture & Tech Stack

LifeStack is architected as an **enterprise modular monolith** enforcing clean separation of concerns, strong domain boundaries, and zero entity leakage.

```text
LifeStack/
├── lifestack-backend/                       # Spring Boot 3.4.3 Modular Monolith (Java 21)
│   ├── src/main/java/com/lifestack/
│   │   ├── admin/                           # Admin operations, telemetry, DAU, moderation
│   │   ├── analytics/                       # Reporting engines and dashboard summaries
│   │   ├── coding/                          # Problems, solutions, Big-O complexity logs
│   │   ├── common/                          # Global exception handlers, DTOs, health checks
│   │   ├── job/                             # Job applications, interview rounds, history
│   │   ├── learning/                        # Roadmaps, topics, progress calculation engine
│   │   ├── note/                            # Notes, tags, resources, bidirectional links
│   │   ├── schedule/                        # Schedule items, priorities, sound toggles
│   │   ├── security/                        # SecurityFilterChain, UserStatusFilter, RBAC
│   │   ├── user/                            # User entities, registration, profile service
│   │   └── workspace/                       # Multi-tenant root organizational boundary
│   ├── src/main/resources/
│   │   ├── db/migration/                    # Flyway SQL migrations (V1 through V6)
│   │   └── application.yml                  # Production and cloud runtime configuration
│   └── pom.xml                              # Maven build file with zero copyleft dependencies
│
└── lifestack-frontend/                      # React 18 + TypeScript + Vite PWA
    ├── src/
    │   ├── components/                      # Common UI, layouts, modals, loaders, footer
    │   ├── context/                         # AuthContext (stateful session management)
    │   ├── features/                        # Feature pages (Roadmaps, Coding, Jobs, Admin, etc.)
    │   ├── lib/                             # api.ts (client SDK), audio.ts (Web Audio chime)
    │   └── router.tsx                       # React Router v6 with AdminRoute guards
    ├── public/                              # PWA manifests, icons, custom SVG favicon
    └── package.json                         # 100% MIT/ISC dependencies
```

### Technology Matrix

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite 6, Tailwind CSS 3.4 |
| **Server State & Routing** | TanStack Query v5, React Router DOM v6 |
| **Forms & Validation** | React Hook Form, Zod v4 |
| **Audio Synthesis** | HTML5 Web Audio API (`AudioContext`, Oscillator chimes) |
| **Backend Runtime** | Java 21, Spring Boot 3.4.3, Maven |
| **Persistence & ORM** | PostgreSQL 18, Spring Data JPA, Hibernate, HikariCP |
| **Database Migrations** | Flyway 10 (Automated, version-controlled scripts) |
| **Security & Auth** | Spring Security 6, BCrypt (12 rounds), Session Cookies, RBAC |
| **PWA Tooling** | Workbox, `vite-plugin-pwa` |

---

## 🔒 Security & Multi-Tenant Isolation

LifeStack conforms to OWASP Top 10 guidelines with defense-in-depth protection:

1. **Broken Object-Level Authorization (BOLA / IDOR) Defense:**
   - Every service query explicitly scopes access by the authenticated principal's ID (`findByIdAndOwnerId`, `findByIdAndWorkspaceOwnerId`).
   - Cross-tenant resource queries return `404 Not Found` without disclosing the existence of records in other workspaces.
2. **First-Party Session Cookie Hardening:**
   - Session identifiers (`JSESSIONID`) are issued with `HttpOnly: true` (preventing XSS access) and `SameSite: Lax` (mitigating CSRF).
   - Environment-variable controlled `Secure` flag (`SESSION_COOKIE_SECURE: true`) enforces HTTPS transmission in production.
3. **Password Cryptography:**
   - BCrypt hashing with a cost factor of 12 rounds (4,096 iterations), exceeding OWASP minimums.
4. **Real-Time Moderation Filter (`UserStatusFilter`):**
   - Intercepts requests before reaching controllers to ensure suspended users (`BLOCKED`) have sessions immediately invalidated with a 403 Forbidden payload.
5. **Strict DTO Isolation:**
   - Persistence entities are never exposed in REST responses. All endpoints serialize strongly typed DTOs wrapped in an `ApiResponse<T>` envelope.
6. **SQL & JSON Injection Protection:**
   - All database queries use parameterized Spring Data JPA or named `@Param` queries. Incoming JSONB settings are validated with Jackson `ObjectMapper` before saving.
7. **DoS Prevention via Pagination Clamping:**
   - Collection endpoints enforce strict page size limits (`Math.min(size, 100)`).

---

## 🗄️ Database Schema & Migrations

LifeStack maintains database integrity through Flyway versioned migrations with cascading deletes (`ON DELETE CASCADE`) referencing `users(id)`:

- **`V1__init_foundation.sql`**: Foundation schema creating `users` and `workspaces` tables.
- **`V2__create_learning_entities.sql`**: Core learning schema creating `roadmaps` and `topics` with ordering and progress modes.
- **`V3__create_notes_and_resources.sql`**: Knowledge management creating `notes`, `resources`, `problems`, `problem_solutions`, and join tables (`note_topics`, `note_problems`, `resource_topics`).
- **`V4__create_job_tracker_entities.sql`**: Career tracker creating `job_applications`, `interview_events`, `application_history`, and `application_notes`.
- **`V5__create_schedules_and_alerts.sql`**: Notification engine creating `schedules` with timestamps, priority levels, and audio toggles.
- **`V6__add_user_roles_status_and_activity.sql`**: Admin and telemetry schema adding `role` and `status` to `users`, and creating `user_daily_activity` with unique `(user_id, activity_date)` constraints for DAU metrics.

---

## 📡 API Reference

All endpoints return a uniform JSON envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "timestamp": "2026-10-29T18:00:00Z"
}
```

### Core API Groups

| Module | Method | Endpoint | Description | Access |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new user account (locks role to `USER`) | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user and establish session cookie | Public |
| **Auth** | `POST` | `/api/v1/auth/logout` | Terminate session and invalidate cookie | Authenticated |
| **User** | `GET` | `/api/v1/users/me` | Fetch authenticated user profile | Authenticated |
| **User** | `PATCH` | `/api/v1/users/me` | Update user display name and timezone | Authenticated |
| **User** | `DELETE` | `/api/v1/users/me` | Permanently delete account and all data | Authenticated |
| **Workspaces**| `GET` | `/api/v1/workspaces` | List all workspaces owned by current user | Authenticated |
| **Workspaces**| `POST` | `/api/v1/workspaces` | Create new workspace container | Authenticated |
| **Workspaces**| `PATCH`| `/api/v1/workspaces/{id}` | Update workspace name or JSON settings | Authenticated |
| **Workspaces**| `DELETE`| `/api/v1/workspaces/{id}` | Delete workspace (prevented if sole workspace) | Authenticated |
| **Roadmaps** | `GET` | `/api/v1/roadmaps?workspaceId={id}` | List roadmaps with progress metrics | Authenticated |
| **Roadmaps** | `POST` | `/api/v1/roadmaps` | Create curriculum roadmap | Authenticated |
| **Topics** | `GET` | `/api/v1/roadmaps/{id}/topics` | Get ordered topics in a roadmap | Authenticated |
| **Topics** | `PUT` | `/api/v1/roadmaps/{id}/topics/reorder` | Reorder topic sequence | Authenticated |
| **Problems** | `GET` | `/api/v1/problems?workspaceId={id}` | Filter coding problems by status/difficulty | Authenticated |
| **Problems** | `POST` | `/api/v1/topics/{topicId}/problems` | Add coding problem to topic | Authenticated |
| **Solutions**| `POST` | `/api/v1/problems/{id}/solutions` | Save solution with Big-O complexity notes | Authenticated |
| **Notes** | `GET` | `/api/v1/notes?workspaceId={id}` | Search notes by query or tags | Authenticated |
| **Notes** | `POST` | `/api/v1/notes` | Create Markdown note with topic/problem links | Authenticated |
| **Jobs** | `GET` | `/api/v1/applications?workspaceId={id}` | Paginated job applications with filters | Authenticated |
| **Jobs** | `POST` | `/api/v1/applications` | Create job application card | Authenticated |
| **Interviews**| `POST` | `/api/v1/applications/{id}/interviews`| Schedule interview round (advances stage) | Authenticated |
| **Schedule** | `GET` | `/api/v1/schedules?workspaceId={id}` | Fetch scheduled alerts and events | Authenticated |
| **Schedule** | `PATCH`| `/api/v1/schedules/{id}/acknowledge`| Acknowledge sound alert | Authenticated |
| **Analytics**| `GET` | `/api/v1/analytics/dashboard` | Aggregated dashboard KPI summary | Authenticated |
| **Analytics**| `GET` | `/api/v1/analytics/jobs/monthly` | 6-month monthly application velocity | Authenticated |
| **Admin** | `GET` | `/api/v1/admin/metrics` | Active sessions, total accounts, DAU | Admin Only |
| **Admin** | `GET` | `/api/v1/admin/system-health` | DB latency, Flyway version, server uptime | Admin Only |
| **Admin** | `GET` | `/api/v1/admin/users` | Paginated user moderation directory | Admin Only |
| **Admin** | `POST` | `/api/v1/admin/users/create-admin` | Provision a new administrator account | Admin Only |
| **Admin** | `POST` | `/api/v1/admin/users/{id}/block` | Block user & immediately revoke sessions | Admin Only |
| **Admin** | `POST` | `/api/v1/admin/users/{id}/unblock` | Unblock user account | Admin Only |
| **Admin** | `DELETE`| `/api/v1/admin/users/{id}` | Permanently purge user account and data | Admin Only |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **JDK 21** or later
- **Apache Maven 3.9+**
- **Node.js 20+** & **npm**
- **PostgreSQL 15+** running on port 5432

### 1. Database Initialization
```sql
CREATE DATABASE lifestack_db;
```

### 2. Backend Configuration & Startup
```bash
cd lifestack-backend

# Configure environment variables (optional overrides)
# DB_URL=jdbc:postgresql://localhost:5432/lifestack_db
# DB_USERNAME=postgres
# DB_PASSWORD=root

# Compile and start Spring Boot service
mvn clean compile
mvn spring-boot:run
```
The backend initializes Flyway migrations automatically and listens on `http://localhost:8080`.

Verify health endpoint:
```bash
curl http://localhost:8080/api/v1/health
```

### 3. Frontend Setup & Startup
```bash
cd lifestack-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The application opens at `http://localhost:5173`. In development mode, Vite automatically proxies all `/api/*` traffic to `http://localhost:8080`.

---

## 🧪 Production Verification & Automated Scans

LifeStack includes comprehensive pre-launch audits. Run these commands prior to deployment:

```bash
# 1. Frontend Security Advisory Scan
cd lifestack-frontend
npm audit

# 2. Strict Frontend Type Check
npx tsc -b

# 3. Production PWA Build
npm run build

# 4. Backend Clean Package
cd ../lifestack-backend
mvn clean package -DskipTests
```

---

## ⚖️ Licensing & Compliance

- **Backend Dependencies:** 100% Permissive (Apache License 2.0, PostgreSQL License, MIT). Zero copyleft (GPL / AGPL).
- **Frontend Packages:** 100% Permissive (MIT, ISC, Apache-2.0).
- **Assets:** Custom SVG logo, loader, and icons sourced from Lucide React (ISC).
- **Terms of Service:** Full legal and acceptable use terms available at `/terms`.

---

## 👨‍💻 Author & Contact

Developed with care by **Soumya**.

- **Portfolio & Works:** [https://soumya-here.vercel.app](https://soumya-here.vercel.app)
- **GitHub:** [@soumya897](https://github.com/soumya897)

---

<div align="center">
  <sub>Built with Spring Boot 3.4, React 18, PostgreSQL 18, and Tailwind CSS.</sub>
</div>
