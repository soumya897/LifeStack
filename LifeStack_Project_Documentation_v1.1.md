# LifeStack — Personal Productivity Platform & Engineering OS
## Project Requirements, Product Specification, and Technical Architecture

**Document version:** 2.0 (Production Release Specification)  
**Status:** Completed & Production-Ready (Milestones 1–11 Implemented & Audited)  
**Product type:** Multi-user developer productivity web application / installable PWA  
**Product name:** LifeStack  
**Author & Portfolio:** Soumya ([https://soumya-here.vercel.app](https://soumya-here.vercel.app))  

---

## 1. Project Overview

LifeStack is an enterprise-grade, customizable personal productivity platform and Progressive Web App (PWA) engineered specifically for software developers and computer science students. It unifies structured curriculum learning, coding problem practice with Big-O complexity logs, recruitment pipeline management on Kanban, knowledge notes, and audio-notified study schedules into a private, multi-tenant workspace.

The platform is designed as a **modular monolith** with Spring Boot 3.4.3 (Java 21) and React 18 (TypeScript, Vite, Tailwind CSS), supporting both individual developers and cloud-scale multi-user SaaS deployments with strict tenant isolation and administrative moderation.

### Core Architectural Pillars
1. **Curriculum Roadmaps:** Hierarchical learning roadmaps (e.g., DSA, System Design, Spring Boot) with sequenced topics, target dates, and configurable progress engines.
2. **Coding Bank & Complexity Vault:** Algorithm problem tracking with difficulty categorization (`EASY`, `MEDIUM`, `HARD`), syntax-highlighted solutions, and asymptotic time/space complexity notes ($\mathcal{O}(N)$, $\mathcal{O}(\log N)$).
3. **Recruitment Kanban & Interview Pipeline:** End-to-end job application tracking through 9 pipeline stages (`SAVED` to `OFFER`/`HIRED`), with round-by-round interview logging and stage transition history.
4. **Knowledge Notes & Resource Linking:** Markdown notes repository with tagging and bidirectional relationships linking notes directly to curriculum topics, coding problems, and job applications.
5. **Schedule & Synthesized Audio Alerts:** Time-based scheduling with priority levels (`LOW`, `MEDIUM`, `HIGH`) and browser-native synthesized chime alerts powered by the HTML5 Web Audio API.
6. **Multi-Dimensional Analytics:** Learning velocity metrics, career conversion funnels, and 6-month monthly application submission trends.
7. **Unified Admin Console & Operations:** Single unified login automatically routing standard users and administrators, concurrent active session tracking via `SessionRegistry`, Daily Active Users (DAU) telemetry, database engine latency metrics, and user moderation (instant account blocking, unblocking, and deletion).

---

## 2. Product Terminology and Information Hierarchy

- **User:** Account owner authenticated via secure session cookies. Carries a `Role` (`USER` or `ADMIN`) and a `UserStatus` (`ACTIVE` or `BLOCKED`).
- **Workspace:** Root tenant container partitioning all user data. Every roadmap, note, job application, and schedule item belongs to exactly one workspace.
- **Roadmap:** High-level learning goal (e.g., "Data Structures & Algorithms", "Microservices Architecture").
- **Topic:** Sequenced unit of study within a roadmap with planned dates, sort order, and weight.
- **Problem:** Coding question with title, difficulty, statement, platform URL, and lifecycle status (`UNSOLVED`, `ATTEMPTED`, `SOLVED`, `MASTERED`).
- **Problem Solution:** Implementation code with language, approach explanation, and asymptotic time/space complexities.
- **Note:** Markdown-formatted knowledge article with tags and bidirectional foreign links.
- **Resource:** External documentation link or reference URL attached to a topic or note.
- **Job Application:** Job opportunity tracked through 9 discrete stages with salary, work mode, and follow-up deadlines.
- **Interview Event:** Assessment or interview round (`PHONE_SCREEN`, `TECHNICAL`, `SYSTEM_DESIGN`, `BEHAVIORAL`, `TAKE_HOME_ASSESSMENT`) linked to a job application.
- **Schedule Item:** Timed calendar event or study block with priorities and Web Audio chime alerts.
- **User Daily Activity:** Daily audit record capturing unique user engagement dates for DAU analytics.

---

## 3. Technology Stack & Component Architecture

### Frontend Architecture
- **Framework & Runtime:** React 18, TypeScript, Vite 6.
- **Styling & Layout:** Tailwind CSS 3.4 with custom design tokens and dark/light contrast palettes.
- **State & Server Cache:** TanStack Query v5 (React Query) for optimistic mutations and stale-while-revalidate fetching.
- **Forms & Validation:** React Hook Form with Zod schema validation.
- **Audio Synthesis:** Browser-native HTML5 Web Audio API (`AudioContext`, Oscillator nodes) generating pleasant chime chords without audio file dependencies.
- **PWA Capabilities:** `vite-plugin-pwa` with Workbox service worker caching and offline fallback.
- **Routing & Guards:** React Router v6 with `AdminRoute` and `ProtectedRoute` guards.

### Backend Architecture
- **Language & Runtime:** Java 21, Spring Boot 3.4.3.
- **Security & RBAC:** Spring Security 6 with `BCryptPasswordEncoder(12)`, `UserStatusFilter`, and `HttpSessionSecurityContextRepository`.
- **Data Persistence:** Spring Data JPA, Hibernate, PostgreSQL 18 with JSONB support and HikariCP connection pooling.
- **Database Migrations:** Flyway 10 automated migrations (V1 to V6).
- **Session Tracking:** Spring Security `SessionRegistryImpl` for concurrent active user monitoring.
- **Exception Handling:** Centralized `@RestControllerAdvice` sanitizing error envelopes (`ApiResponse<T>`) and logging stack traces internally via SLF4J.

---

## 4. Application Navigation & Screen Hierarchy

```text
LifeStack Navigation
├── /login                         # Single unified login (auto-redirects User vs Admin)
├── /register                      # Public self-registration (locked strictly to Role.USER)
├── /dashboard                     # Executive summary, active roadmaps, today's schedule, pipeline KPIs
├── /learning                      # Curriculum roadmaps list, progress bars, create roadmap modal
│   └── /learning/:roadmapId       # Roadmap detail, topic sequence, reordering, progress stats
│       └── /topics/:topicId       # Topic detail with coding problems, notes, and attached resources
├── /coding                        # Coding bank, difficulty filters, solution viewer/editor, Big-O notes
├── /notes                         # Knowledge notes vault, search by title/tag, Markdown viewer/editor
├── /jobs                          # Job application tracker (Kanban board & interactive table views)
│   └── /jobs/:applicationId       # Application detail, interview rounds timeline, status history
├── /schedule                      # Calendar schedule, study blocks, audio chime notifications drawer
├── /analytics                     # Multi-dimensional analytics: learning velocity, career conversion funnel
├── /admin                         # Administrative operations console (Admin role only)
│   ├── Metrics                    # Concurrent active sessions, total accounts, DAU 7-day/30-day metrics
│   ├── User Directory             # Moderation table: search, filter by role/status, block/unblock, delete
│   ├── System Health              # PostgreSQL latency, connection pool, Flyway migration version, uptime
│   └── Cloud Telemetry            # Row-level multi-tenant security verification and provisioning audit
├── /settings                      # User profile, display name, timezone, and permanent account self-deletion
└── /terms                         # Terms of Service, Acceptable Use, and portfolio attribution
```

---

## 5. Database Schema & Flyway Migrations

The LifeStack database schema is version-controlled through 6 Flyway migrations with cascading deletes (`ON DELETE CASCADE`) referencing `users(id)`:

### Migration Chronology

#### `V1__init_foundation.sql`
- **`users`**: `id` (UUID PK), `email` (VARCHAR 255 UNIQUE), `password_hash` (VARCHAR 255), `display_name` (VARCHAR 100), `timezone` (VARCHAR 50), `created_at`, `updated_at`.
- **`workspaces`**: `id` (UUID PK), `owner_id` (UUID FK -> users ON DELETE CASCADE), `name` (VARCHAR 100), `description` (TEXT), `settings` (JSONB), `created_at`, `updated_at`.

#### `V2__create_learning_entities.sql`
- **`roadmaps`**: `id` (UUID PK), `workspace_id` (UUID FK -> workspaces ON DELETE CASCADE), `name` (VARCHAR 150), `description` (TEXT), `status` (VARCHAR 20), `progress_mode` (VARCHAR 20), `start_date` (DATE), `target_date` (DATE), `completed_at` (TIMESTAMPTZ), `created_at`, `updated_at`.
- **`topics`**: `id` (UUID PK), `roadmap_id` (UUID FK -> roadmaps ON DELETE CASCADE), `title` (VARCHAR 200), `description` (TEXT), `status` (VARCHAR 20), `sort_order` (INT), `weight` (INT DEFAULT 1), `start_date` (DATE), `target_date` (DATE), `completed_at` (TIMESTAMPTZ), `created_at`, `updated_at`.

#### `V3__create_notes_and_resources.sql`
- **`notes`**: `id` (UUID PK), `workspace_id` (UUID FK), `owner_id` (UUID FK -> users ON DELETE CASCADE), `title` (VARCHAR 200), `content` (TEXT), `tags` (VARCHAR 255), `created_at`, `updated_at`.
- **`resources`**: `id` (UUID PK), `workspace_id` (UUID FK), `owner_id` (UUID FK), `title` (VARCHAR 200), `url` (TEXT), `resource_type` (VARCHAR 50), `created_at`.
- **`problems`**: `id` (UUID PK), `topic_id` (UUID FK -> topics ON DELETE CASCADE), `title` (VARCHAR 200), `statement` (TEXT), `difficulty` (VARCHAR 20), `platform_url` (TEXT), `status` (VARCHAR 20), `created_at`, `updated_at`.
- **`problem_solutions`**: `id` (UUID PK), `problem_id` (UUID FK -> problems ON DELETE CASCADE), `language` (VARCHAR 50), `code` (TEXT), `approach` (TEXT), `time_complexity` (VARCHAR 50), `space_complexity` (VARCHAR 50), `created_at`, `updated_at`.
- **Junction tables**: `note_topics`, `note_problems`, `resource_topics`.

#### `V4__create_job_tracker_entities.sql`
- **`job_applications`**: `id` (UUID PK), `workspace_id` (UUID FK), `owner_id` (UUID FK -> users ON DELETE CASCADE), `company_name` (VARCHAR 200), `job_title` (VARCHAR 200), `source` (VARCHAR 100), `job_url` (TEXT), `applied_at` (DATE), `status` (VARCHAR 30), `location` (VARCHAR 150), `work_mode` (VARCHAR 20), `salary` (VARCHAR 100), `notes` (TEXT), `follow_up_at` (DATE), `created_at`, `updated_at`.
- **`interview_events`**: `id` (UUID PK), `application_id` (UUID FK -> job_applications ON DELETE CASCADE), `round_name` (VARCHAR 100), `event_type` (VARCHAR 50), `scheduled_at` (TIMESTAMPTZ), `occurred_at` (TIMESTAMPTZ), `status` (VARCHAR 30), `result` (VARCHAR 30), `notes` (TEXT), `created_at`, `updated_at`.
- **`application_history`**: `id` (UUID PK), `application_id` (UUID FK), `from_status` (VARCHAR 30), `to_status` (VARCHAR 30), `note` (TEXT), `created_at` (TIMESTAMPTZ).
- **`application_notes`**: `application_id` (UUID FK), `note_id` (UUID FK).

#### `V5__create_schedules_and_alerts.sql`
- **`schedules`**: `id` (UUID PK), `workspace_id` (UUID FK), `owner_id` (UUID FK -> users ON DELETE CASCADE), `title` (VARCHAR 200), `description` (TEXT), `item_type` (VARCHAR 50), `target_id` (UUID), `target_name` (VARCHAR 200), `scheduled_at` (TIMESTAMPTZ), `priority` (VARCHAR 20), `status` (VARCHAR 20), `sound_enabled` (BOOLEAN DEFAULT TRUE), `notified_at` (TIMESTAMPTZ), `created_at`, `updated_at`.

#### `V6__add_user_roles_status_and_activity.sql`
- **Alter `users`**: Added `role` (VARCHAR 20 NOT NULL DEFAULT 'USER'), `status` (VARCHAR 20 NOT NULL DEFAULT 'ACTIVE'), and `last_active_at` (TIMESTAMPTZ).
- **`user_daily_activity`**: `id` (UUID PK), `user_id` (UUID FK -> users ON DELETE CASCADE), `activity_date` (DATE NOT NULL), `created_at` (TIMESTAMPTZ), with unique constraint `(user_id, activity_date)` for DAU metric deduplication.

---

## 6. Progress Calculation & Timeline Engine

All progress metrics are calculated authoritatively by the backend `ProgressCalculationService`:

### Progress Modes & Formulas
1. **Topic-Based Mode (`TOPIC`):**
   $$\text{Progress} = \left(\frac{\text{Completed Topics}}{\text{Total Topics}}\right) \times 100$$
2. **Task-Based Mode (`TASK`):**
   $$\text{Progress} = \left(\frac{\text{Completed Tasks}}{\text{Total Tasks}}\right) \times 100$$
3. **Weighted Mode (`WEIGHTED`):**
   $$\text{Progress} = \left(\frac{\sum \text{Completed Item Weights}}{\sum \text{All Item Weights}}\right) \times 100$$

### Boundary Protections
- **Zero Divisor Guard:** When `total == 0` or total weights $\le 0$, the calculation returns `0.0%` cleanly rather than throwing an `ArithmeticException`.
- **Weight Enforcements:** Task and topic weights are strictly enforced to be $\ge 1$ via Bean Validation `@Min(1)`.
- **Timeline Health:** 
  - `daysRemaining = ChronoUnit.DAYS.between(now, targetDate)`
  - `elapsedDays = ChronoUnit.DAYS.between(createdAt, now)`
  - `isOverdue = now.isAfter(targetDate) && status != COMPLETED`

---

## 7. Security Architecture & Pre-Launch Audit Verification

The codebase has undergone a full pre-launch audit across all OWASP Top 10 vectors:

### 1. BOLA / IDOR Protection
Every service method handling entity identifiers (`workspaceId`, `roadmapId`, `topicId`, `problemId`, `noteId`, `applicationId`, `scheduleId`) explicitly verifies user ownership:
- Example: `roadmapRepository.findByIdAndWorkspaceOwnerId(roadmapId, userId)`
- Requests for records belonging to another tenant raise `ResourceNotFoundException`, returning HTTP `404 Not Found` without disclosing whether the record ID exists.

### 2. Authentication & Session Cookies
- **First-Party Cookies:** LifeStack utilizes `JSESSIONID` cookie-based sessions with `HttpOnly: true` (preventing script extraction) and `SameSite: Lax` (mitigating CSRF).
- **TLS Hardening:** Configured with `${SESSION_COOKIE_SECURE:false}` ensuring `Secure: true` in production HTTPS deployments.
- **Work Factor:** Password hashing uses `BCryptPasswordEncoder(12)` (12 rounds / 4,096 iterations).

### 3. Real-Time Moderation (`UserStatusFilter`)
- The `UserStatusFilter` intercepts requests before Spring Security authorization filters. If a user's database status is `BLOCKED`, active HTTP sessions are immediately invalidated (`session.invalidate()`), SecurityContext is cleared, and an HTTP `403 Forbidden` response (`"Account is suspended"`) is returned.

### 4. Administrative Role Boundary
- Public registration (`POST /api/v1/auth/register`) strips any client-provided role and hardcodes `Role.USER`.
- Administrator accounts can only be provisioned through the authenticated admin console via `POST /api/v1/admin/users/create-admin`.
- Administrative routes (`/api/v1/admin/**`) are secured with `.hasRole('ADMIN')` and method-level `@PreAuthorize("hasRole('ADMIN')")`.

### 5. Input Validation & DoS Prevention
- All request DTOs use Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Size`, `@Min`, `@Email`).
- Incoming JSONB payloads in `WorkspaceService` are validated with Jackson `ObjectMapper.readTree()` to reject malformed JSON syntax with descriptive 400 errors.
- Collection endpoints (`/api/v1/applications` and `/api/v1/admin/users`) enforce strict page size clamping:
  ```java
  int clampedSize = Math.max(1, Math.min(size, 100));
  int clampedPage = Math.max(0, page);
  Pageable pageable = PageRequest.of(clampedPage, clampedSize, sort);
  ```

---

## 8. Complete REST API Specification

All responses adhere to the standard envelope:
```json
{
  "success": boolean,
  "message": string,
  "data": T,
  "timestamp": string
}
```

### Complete Endpoint Directory

| Endpoint | HTTP Method | Description | Security |
| :--- | :---: | :--- | :---: |
| `/api/v1/auth/register` | `POST` | Register new account (defaults to `USER`) | Public |
| `/api/v1/auth/login` | `POST` | Authenticate credentials and establish session | Public |
| `/api/v1/auth/logout` | `POST` | Invalidate active session and clear cookie | Authenticated |
| `/api/v1/users/me` | `GET` | Fetch authenticated user profile | Authenticated |
| `/api/v1/users/me` | `PATCH` | Update display name and timezone | Authenticated |
| `/api/v1/users/me` | `DELETE` | Permanently self-delete account and cascade | Authenticated |
| `/api/v1/workspaces` | `GET` | List user workspaces | Authenticated |
| `/api/v1/workspaces` | `POST` | Create workspace | Authenticated |
| `/api/v1/workspaces/{id}` | `GET` | Get workspace details | Authenticated |
| `/api/v1/workspaces/{id}` | `PATCH` | Update workspace name or JSON settings | Authenticated |
| `/api/v1/workspaces/{id}` | `DELETE` | Delete workspace (cannot delete sole workspace) | Authenticated |
| `/api/v1/roadmaps` | `GET` | List roadmaps in workspace with progress | Authenticated |
| `/api/v1/roadmaps` | `POST` | Create curriculum roadmap | Authenticated |
| `/api/v1/roadmaps/{id}` | `GET` | Get roadmap detail with topics | Authenticated |
| `/api/v1/roadmaps/{id}` | `PATCH` | Update roadmap metadata / status | Authenticated |
| `/api/v1/roadmaps/{id}` | `DELETE` | Delete roadmap | Authenticated |
| `/api/v1/roadmaps/{id}/topics` | `GET` | List ordered topics in roadmap | Authenticated |
| `/api/v1/roadmaps/{id}/topics` | `POST` | Add topic to roadmap | Authenticated |
| `/api/v1/roadmaps/{id}/topics/reorder` | `PUT` | Reorder topic sequence | Authenticated |
| `/api/v1/topics/{id}` | `GET` | Get topic details | Authenticated |
| `/api/v1/topics/{id}` | `PATCH` | Update topic properties | Authenticated |
| `/api/v1/topics/{id}/status` | `PATCH` | Update topic status | Authenticated |
| `/api/v1/topics/{id}` | `DELETE` | Delete topic | Authenticated |
| `/api/v1/problems` | `GET` | Filter problems by status/difficulty | Authenticated |
| `/api/v1/problems/{id}` | `GET` | Get problem details with solutions | Authenticated |
| `/api/v1/topics/{topicId}/problems` | `POST` | Add coding problem to topic | Authenticated |
| `/api/v1/problems/{id}` | `PATCH` | Update problem details | Authenticated |
| `/api/v1/problems/{id}` | `DELETE` | Delete problem | Authenticated |
| `/api/v1/problems/{id}/solutions` | `GET` | List saved solutions for problem | Authenticated |
| `/api/v1/problems/{id}/solutions` | `POST` | Save solution with Big-O complexity | Authenticated |
| `/api/v1/solutions/{id}` | `PATCH` | Update solution code / approach | Authenticated |
| `/api/v1/solutions/{id}` | `DELETE` | Delete solution | Authenticated |
| `/api/v1/notes` | `GET` | Search notes by query or tags | Authenticated |
| `/api/v1/notes` | `POST` | Create note (with optional topic/problem link) | Authenticated |
| `/api/v1/notes/{id}` | `GET` | Get note details | Authenticated |
| `/api/v1/notes/{id}` | `PATCH` | Update note title / content / tags | Authenticated |
| `/api/v1/notes/{id}` | `DELETE` | Delete note | Authenticated |
| `/api/v1/resources` | `GET` | List resources in workspace | Authenticated |
| `/api/v1/resources` | `POST` | Create external reference resource | Authenticated |
| `/api/v1/resources/{id}` | `DELETE` | Delete resource | Authenticated |
| `/api/v1/applications` | `GET` | Paginated job applications with filters | Authenticated |
| `/api/v1/applications` | `POST` | Create job application | Authenticated |
| `/api/v1/applications/{id}` | `GET` | Get application details with interview history | Authenticated |
| `/api/v1/applications/{id}` | `PATCH` | Update application status or details | Authenticated |
| `/api/v1/applications/{id}` | `DELETE` | Delete job application | Authenticated |
| `/api/v1/applications/{id}/interviews`| `GET` | List interview rounds for application | Authenticated |
| `/api/v1/applications/{id}/interviews`| `POST` | Schedule interview round | Authenticated |
| `/api/v1/interviews/{id}` | `PATCH` | Update interview results / feedback | Authenticated |
| `/api/v1/interviews/{id}` | `DELETE` | Delete interview event | Authenticated |
| `/api/v1/schedules` | `GET` | List scheduled items and alarms | Authenticated |
| `/api/v1/schedules` | `POST` | Create schedule event | Authenticated |
| `/api/v1/schedules/{id}` | `PATCH` | Update schedule event | Authenticated |
| `/api/v1/schedules/{id}/acknowledge`| `PATCH`| Acknowledge notification | Authenticated |
| `/api/v1/schedules/{id}` | `DELETE` | Delete schedule item | Authenticated |
| `/api/v1/analytics/dashboard` | `GET` | Overview metrics and summary KPIs | Authenticated |
| `/api/v1/analytics/roadmaps` | `GET` | Roadmap completion statistics | Authenticated |
| `/api/v1/analytics/jobs/summary` | `GET` | Job application stage breakdown | Authenticated |
| `/api/v1/analytics/jobs/monthly` | `GET` | 6-month monthly application velocity | Authenticated |
| `/api/v1/analytics/jobs/by-source` | `GET` | Application volume by job source | Authenticated |
| `/api/v1/analytics/jobs/interviews` | `GET` | Interview round distribution metrics | Authenticated |
| `/api/v1/admin/metrics` | `GET` | Concurrent sessions, account count, DAU | Admin Only |
| `/api/v1/admin/system-health` | `GET` | DB latency, Flyway migrations, uptime | Admin Only |
| `/api/v1/admin/users` | `GET` | Paginated user directory with filters | Admin Only |
| `/api/v1/admin/users/create-admin` | `POST` | Provision new administrator | Admin Only |
| `/api/v1/admin/users/{id}/block` | `POST` | Block user & immediately revoke sessions | Admin Only |
| `/api/v1/admin/users/{id}/unblock` | `POST` | Unblock user account | Admin Only |
| `/api/v1/admin/users/{id}` | `DELETE` | Permanently purge user and cascade data | Admin Only |
| `/api/v1/health` | `GET` | System health check and DB readiness | Public |

---

## 9. Implemented Milestones & Delivery Record

| Milestone | Scope & Deliverables | Status |
| :--- | :--- | :---: |
| **Milestone 1** | Project Foundation, Spring Boot 3.4 setup, PostgreSQL, Flyway V1, React Vite PWA shell | **COMPLETED** |
| **Milestone 2** | User authentication, BCrypt 12 rounds, Session cookie auth, registration, profile service | **COMPLETED** |
| **Milestone 3** | Workspace multi-tenant container, default workspace provisioning, dashboard summary API | **COMPLETED** |
| **Milestone 4** | Curriculum roadmaps, sequenced topics, drag-and-drop reorder, Flyway V2, progress engine | **COMPLETED** |
| **Milestone 5** | Notes library with tags, Coding problems, syntax-highlighted solutions, Big-O notes, Flyway V3 | **COMPLETED** |
| **Milestone 6** | Job application tracker, Kanban pipeline, interview rounds, history logs, Flyway V4 | **COMPLETED** |
| **Milestone 7** | Analytics reporting, conversion funnels, monthly velocity graphs, dashboard charts | **COMPLETED** |
| **Milestone 8** | Calendar schedule, priority levels, Web Audio API synthesized chimes, Flyway V5 | **COMPLETED** |
| **Milestone 9** | Unified Admin Console, Single Unified Login, DAU tracking, system health, Flyway V6 | **COMPLETED** |
| **Milestone 10** | Cascading account deletion (Self-Delete via `/users/me` & Admin Purge via `/admin/users/{id}`) | **COMPLETED** |
| **Milestone 11** | Terms of Service (`/terms`), Global footer, legal compliance, Pre-Launch OWASP Security Audit | **COMPLETED** |

---

## 10. Licensing, Copyright & Compliance

- **Backend Dependencies:** 100% Permissive (Apache License 2.0, PostgreSQL License, MIT). Zero copyleft dependencies.
- **Frontend Dependencies:** 100% Permissive (MIT, ISC, Apache-2.0).
- **Brand Assets & Fonts:** Custom SVG monogram and loader. Lucide React icons under ISC.
- **Pre-Launch Audit:** Clean verification with zero critical vulnerabilities. All pagination parameters bounded to prevent DoS.

---

## 11. Developer & Portfolio Attribution

**LifeStack** is designed and implemented by **Soumya**.

- **Portfolio:** [https://soumya-here.vercel.app](https://soumya-here.vercel.app)
- **GitHub:** [https://github.com/soumya897](https://github.com/soumya897)

---

**End of Specification.**
