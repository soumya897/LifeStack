# LifeStack — Personal Productivity Platform
## Project Requirements, Product Specification, and Technical Architecture

**Document version:** 1.1  
**Status:** MVP planning — pre-Milestone 1 decisions incorporated  
**Product type:** Multi-user productivity web application / installable PWA  
**Product name:** LifeStack

---

## 1. Project Overview

LifeStack is a customizable personal productivity platform that helps people organize learning, coding practice, notes, timelines, tasks, and job applications in one place.

The platform is intended to support both personal use and future growth into a public SaaS product where users can sign up and manage their own private workspaces.

The core product idea is to combine:
- Learning roadmaps and topic timelines
- Notes, resources, and coding problems attached to topics
- Configurable progress calculations and elapsed-time tracking
- A job application tracker with interview stages and monthly analytics
- A daily dashboard that shows priorities and progress

**Product principle:** keep important business entities—such as roadmaps, topics, coding problems, applications, and interview events—structured, intuitive, queryable, and streamlined for daily productivity.

## 2. Goals

### Primary goals
1. Let users create and manage learning roadmaps such as DSA, Core Java, and Spring Boot.
2. Let users add an unlimited number of topics, tasks, notes, resources, and coding problems.
3. Track completion percentage, creation date, start date, target date, elapsed days, and overdue status.
4. Support coding problems at configurable difficulty levels such as Basic, Medium, and Hard.
5. Let users record job applications, sources, job links, application dates, interview rounds, and outcomes.
6. Provide monthly and overall analytics.
7. Make the app responsive and installable as a Progressive Web App (PWA).
8. Protect each user's data from access by other users.
9. Build a portfolio-quality application with a maintainable architecture.

### Non-goals for the MVP
- AI-generated study plans or notes
- Automatic job scraping or job application submission
- Team collaboration and shared workspaces
- Separate native Android/iOS applications
- Full offline editing and conflict-resolution synchronization
- Arbitrary user-defined code, SQL, or formula execution
- Complex user-defined automation workflows

## 3. Target Users and Example Use Cases

### Target users
- Students and recent graduates
- Developers tracking learning and coding practice
- Job seekers tracking applications and interviews
- People who want a customizable personal productivity system

### Example use cases
- Create a DSA roadmap with Arrays, Strings, ArrayList, Linked List, Stack, Queue, and other topics.
- Add multiple Basic, Medium, and Hard coding problems to a topic.
- Save code, solutions, explanations, complexity analysis, notes, PDFs, videos, and links.
- Keep a completed Core Java roadmap available for revision.
- Track Spring Boot topics such as Hibernate, entity mapping, repositories, security, and REST APIs.
- Create a job application with only the known fields, then add more custom fields when needed.
- Track an application through assessment, technical interviews, HR, offer, rejection, or withdrawal.
- Review how many applications were submitted in a given month and how many interviews took place.

## 4. Product Terminology and Information Hierarchy

Use the following terminology consistently in the UI and code:

- **User:** account owner.
- **Workspace:** container for a user's organized work.
- **Area:** optional grouping such as Learning, Career, or Personal.
- **Roadmap:** a goal or ordered learning plan, e.g. DSA Roadmap.
- **Topic:** a step within a roadmap, e.g. ArrayList.
- **Task:** an actionable item with status, due date, and optional weight.
- **Problem:** a coding question with statement, difficulty, solution, and attempts.
- **Note:** reusable written knowledge.
- **Resource:** a URL or uploaded file attached to a relevant record.
- **Application:** one specific job opportunity submitted to a company.
- **Interview event:** one assessment or interview round related to an application.
- **Dashboard widget:** a summary component shown on the dashboard.

Do not treat a company as the application record. One company may have multiple vacancies and applications.

## 5. Recommended Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query for server-state fetching and caching
- React Hook Form and Zod for forms and client-side validation
- A charting library such as Recharts
- A code editor such as CodeMirror or Monaco for coding solutions
- Vite PWA tooling for manifest and service worker integration

### Backend
- Java
- Spring Boot
- Maven
- Spring Web for REST APIs
- Spring Security for authentication and authorization
- Spring Data JPA / Hibernate
- Jakarta Bean Validation
- Flyway for versioned database migrations
- JUnit and Spring Boot Test for automated testing

### Database and storage
- PostgreSQL
- JSONB for selected flexible configuration and field values
- Object storage for uploaded files when file uploads are implemented

### Development and deployment
- Git and GitHub
- Environment-based configuration and secrets
- HTTPS deployment
- Automated build and test checks where practical
- Database backups and restoration testing

### Architecture choice
Use a **modular monolith**. Keep feature boundaries clear inside one Spring Boot application. Do not introduce microservices for the MVP.

### Authentication and deployment decision
Prefer a same-site deployment where the frontend exposes `/api/*` through a reverse proxy to the Spring Boot backend. This keeps browser API requests first-party even when the backend runs on a separate service. Configure proxy forwarding, HTTPS, session cookies, CSRF protection, session expiration, and logout correctly.

Do not assume that `SameSite=None; Secure` makes cross-site cookies reliable in every browser; privacy protections, especially on mobile Safari, may still block them. Decide and test the deployment topology before finalizing authentication.

If a same-site proxy or shared custom domain is not feasible, explicitly evaluate an access-token design with short-lived access tokens held in memory and a carefully secured refresh mechanism. Do not store long-lived access or refresh tokens in local storage. Document the tradeoffs and test supported browsers before committing to the approach.

## 6. Application Navigation and Screens

### Main navigation
1. Dashboard
2. Today
3. Learning / Roadmaps
4. Coding Practice
5. Notes
6. Job Tracker
7. Analytics
8. Settings
   - Profile and account security
   - Appearance and timezone
   - Active workspace management
   - Data export and account deletion

### Screen 1: Dashboard
Route: `/dashboard`

Display:
- Active roadmaps
- Completed tasks
- Tasks due today and overdue tasks
- Recent learning activity
- Roadmap progress summaries
- Applications submitted this month
- Upcoming interview events
- Job applications requiring follow-up
- Quick-create actions

Dashboard data should come from a summary API. Do not download every record and calculate the entire dashboard in the browser.

For the MVP, use a fixed set of widgets. Customizable widget ordering can be added later.

### Screen 2: Learning / Roadmaps
Routes:
- `/learning`
- `/learning/:roadmapId`

Features:
- Create, edit, archive, duplicate, and delete roadmaps
- Search, sort, and filter roadmaps
- Set descriptions, start dates, target dates, and status
- Create, reorder, and manage topics
- Configure progress mode
- Keep completed roadmaps available for revision

### Screen 3: Topic Details
Route: `/learning/:roadmapId/topics/:topicId`

Sections or tabs:
- Overview
- Tasks
- Coding Problems
- Notes
- Resources
- Revisions

Topic features:
- Status and completion
- Optional start date, due date, and target date
- Unlimited tasks, problems, notes, and resources
- Difficulty and status filters for problems
- Related notes and links
- Revision dates and attempts

### Screen 4: Coding Practice
Features:
- Create unlimited coding problems
- Difficulty: Basic, Medium, Hard (configurable where appropriate)
- Problem statement and examples
- Language selection
- Code editor / saved solution
- Approach and explanation
- Time complexity and space complexity
- Attempt status: Not Started, Attempted, Solved, Needs Revision
- Optional platform URL and tags
- Link a problem to a roadmap topic
- Store multiple attempts or solutions later if needed

Saving a solution does not imply the problem is mastered. Keep problem status distinct from topic completion.

### Screen 5: Notes
Route: `/notes`

Features:
- Standalone notes and notes attached to other records
- Rich text, headings, lists, and code blocks
- Tags, categories, favorites, and search
- Links to topics, problems, applications, or other records
- Optional files and external URLs
- Edit timestamps
- Export capability in a later MVP milestone

Use one notes system for both standalone and attached notes.

### Screen 6: Job Tracker
Routes:
- `/jobs`
- `/jobs/:applicationId`

Views:
- Table view with sorting, filters, and pagination
- Kanban view by application status
- Analytics view

Application fields include:
- Company name
- Job title / role
- Job source (LinkedIn, referral, QSpiders, company site, etc.)
- Job URL
- Application date
- Current status
- Location and work mode, if known
- Notes and follow-up date
- Custom fields

Fields such as salary, recruiter name, recruiter email, referral name, or job ID should be optional/customizable.

Application stages should be configurable, with a sensible default:
- Saved
- Applied
- Assessment
- Interview
- Offer
- Hired

Other outcomes:
- Rejected
- Withdrawn
- On Hold
- No Response

An application should have an activity/interview history. Interview events may include:
- Event type: aptitude, assessment, technical round, HR round, etc.
- Scheduled or completed date/time
- Status/result
- Feedback and notes
- Attachments or links

Keep interview event history separate from the current application status.

### Screen 7: Analytics
Features:
- Roadmap and topic completion
- Tasks completed over time
- Monthly applications submitted
- Applications by source and status
- Number of assessments and interviews by type/round
- Offers, rejections, withdrawals, and pending applications
- Follow-ups due

Define reporting semantics carefully:
- Applications submitted in a month are counted by application date.
- Interview events in a month are counted by event date.
- Applications created in a month are a different metric from applications submitted in a month.
- Distinguish companies from individual applications.

### Screen 8: Settings
Route: `/settings`

Features:
- Profile and security
- Active workspace management
- Timezone and date preferences
- Architecture & platform capabilities inspection
- Export data
- Delete account and personal data, subject to applicable retention requirements

## 7. Progress and Timeline Rules

### Dates to track
For roadmaps and topics where applicable:
- `created_at`: when the record was created
- `start_date`: planned or actual start date, depending on defined semantics
- `target_date`: planned deadline
- `completed_at`: actual completion timestamp
- `updated_at`: last update timestamp

Elapsed time since creation is calculated from `created_at`. Deadline remaining/overdue is calculated from `target_date`. Do not confuse these measurements.

Use UTC timestamps for actual events and a user's timezone for date-sensitive dashboard displays. Use SQL `date` for date-only concepts such as an application date when a time is not meaningful.

### Progress modes
Support:
1. **Topic-based:** completed topics / total topics.
2. **Task-based:** completed tasks / total tasks.
3. **Weighted:** completed weight / total weight.

Formula:
`progress = completed_units / total_units * 100`

For weighted progress:
`progress = sum(completed item weights) / sum(all item weights) * 100`

Rules:
- Avoid division by zero; empty roadmaps should display an empty/not-started state rather than a misleading 100%.
- Define how archived, skipped, or cancelled items affect progress.
- Validate weights as positive values.
- Use a single backend calculation service as the source of truth.
- Do not treat a completed topic as proof that every problem has been mastered.
- Progress percentages may be cached for performance later, but derived data must have a clear invalidation strategy.

## 8. Database Design

The schema below is a logical starting point. Add indexes, constraints, timestamps, and foreign keys as implementation requires.

### Identity and workspace
#### `users`
- `id` UUID primary key
- `email` unique, normalized
- `password_hash`
- `display_name`
- `timezone`
- `created_at`
- `updated_at`

#### `workspaces`
- `id` UUID primary key
- `owner_id` FK to `users.id`
- `name`
- `description`
- `settings` JSONB
- `created_at`
- `updated_at`

#### Optional `areas`
Use if users need higher-level groupings such as Learning, Career, and Personal. Do not make this an unnecessary dependency if workspace + roadmap is sufficient for the first release.

### Learning
#### `roadmaps`
- `id` UUID
- `workspace_id` FK
- `name`
- `description`
- `status`
- `start_date`
- `target_date`
- `completed_at`
- `progress_mode`
- `created_at`
- `updated_at`

#### `topics`
- `id` UUID
- `roadmap_id` FK
- `title`
- `description`
- `status`
- `sort_order`
- `start_date`
- `target_date`
- `completed_at`
- `created_at`
- `updated_at`

#### `tasks`
- `id` UUID
- `workspace_id` FK
- `topic_id` nullable FK where applicable
- `title`
- `description`
- `status`
- `weight`
- `due_at`
- `completed_at`
- `created_at`
- `updated_at`

If tasks can be attached to many types of parent records, prefer explicit relationship tables or a well-defined parent model rather than an unconstrained polymorphic ID with no foreign key enforcement.

#### `problems`
- `id` UUID
- `topic_id` FK
- `title`
- `statement`
- `difficulty`
- `platform_url`
- `status`
- `created_at`
- `updated_at`

#### `problem_solutions` (or an initial solution field on `problems`)
- `id` UUID
- `problem_id` FK
- `language`
- `code`
- `approach`
- `time_complexity`
- `space_complexity`
- `created_at`
- `updated_at`

Use a separate table if multiple languages or attempts are expected.

### Notes and resources
#### `notes`
- `id` UUID
- `owner_id` FK
- `title`
- `content`
- `created_at`
- `updated_at`

#### `resources`
- `id` UUID
- `owner_id` FK
- `name`
- `resource_type`
- `url` or storage key
- `created_at`

#### Relationship tables
Use explicit junction tables such as `topic_notes`, `problem_notes`, `application_notes`, `topic_resources`, or a carefully designed generic attachment model. Enforce ownership and authorization across linked records.

### Job tracking
#### `applications`
- `id` UUID
- `workspace_id` FK
- `company_name`
- `job_title`
- `source`
- `job_url`
- `applied_at`
- `status`
- `follow_up_at`
- `created_at`
- `updated_at`

Keep core application fields such as status and application date as typed columns.

Add other frequently queried core fields as proper columns when justified.

#### `interview_events`
- `id` UUID
- `application_id` FK
- `event_type`
- `scheduled_at`
- `occurred_at`
- `status`
- `result`
- `notes`
- `created_at`
- `updated_at`

Use an application activity/history table (`application_history`) if a durable history of status changes is required.

### Schema design rules
- Use UUID identifiers for exposed records.
- Use foreign keys and indexes.
- Index common filters such as owner/workspace, status, application date, roadmap ID, and due date.
- Enforce authorization through ownership and parent relationships.
- Use migrations with Flyway; do not rely on production Hibernate auto-DDL.
- Keep critical fields typed and queryable.
- Define soft deletion or archive behavior explicitly.
- Use transactions for multi-table writes.

## 9. REST API Outline

Prefix: `/api/v1`

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `GET /users/me`
- `PATCH /users/me`

### Workspaces
- `GET /workspaces`
- `POST /workspaces`
- `GET /workspaces/{id}`
- `PATCH /workspaces/{id}`
- `DELETE /workspaces/{id}`

### Roadmaps and topics
- `GET /roadmaps`
- `POST /roadmaps`
- `GET /roadmaps/{id}`
- `PATCH /roadmaps/{id}`
- `DELETE /roadmaps/{id}`
- `POST /roadmaps/{id}/topics`
- `PATCH /topics/{id}`
- `PATCH /topics/{id}/status`
- `DELETE /topics/{id}`

### Tasks and problems
- `GET /topics/{id}/tasks`
- `POST /topics/{id}/tasks`
- `PATCH /tasks/{id}`
- `DELETE /tasks/{id}`
- `GET /topics/{id}/problems`
- `POST /topics/{id}/problems`
- `PATCH /problems/{id}`
- `DELETE /problems/{id}`

### Notes and Resources
- `GET /notes`
- `POST /notes`
- `GET /notes/{id}`
- `PATCH /notes/{id}`
- `DELETE /notes/{id}`

### Job applications
- `GET /applications`
- `POST /applications`
- `GET /applications/{id}`
- `PATCH /applications/{id}`
- `DELETE /applications/{id}`
- `POST /applications/{id}/interviews`
- `PATCH /interviews/{id}`
- `GET /applications/{id}/history`

### Analytics
- `GET /analytics/dashboard`
- `GET /analytics/roadmaps`
- `GET /analytics/jobs/monthly`
- `GET /analytics/jobs/by-source`
- `GET /analytics/jobs/interviews`

API guidelines:
- Use DTOs rather than exposing JPA entities directly.
- Validate inputs with Bean Validation.
- Use consistent error responses.
- Use pagination for lists.
- Use query parameters for filters and date ranges.
- Use transactions for related writes.
- Verify record ownership on every read, update, and delete.
- Never trust a user-supplied owner ID; derive the current user from the authenticated session.

## 11. Suggested Code Organization

### Backend
```text
lifestack-backend/
├── src/main/java/com/lifestack/
│   ├── LifeStackApplication.java
│   ├── common/
│   │   ├── config/
│   │   ├── exception/
│   │   └── response/
│   ├── security/
│   ├── user/
│   ├── workspace/
│   ├── roadmap/
│   ├── topic/
│   ├── task/
│   ├── problem/
│   ├── note/
│   ├── resource/
│   ├── application/
│   ├── interview/
│   └── analytics/
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
└── pom.xml
```

Each feature package should contain the relevant entity, repository, service, DTO, mapper, and controller as appropriate. Keep business logic in services.

### Frontend
```text
lifestack-frontend/
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── charts/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── learning/
│   │   ├── coding/
│   │   ├── notes/
│   │   ├── jobs/
│   │   └── analytics/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   └── main.tsx
├── vite.config.ts
└── package.json
```

## 12. PWA Requirements

MVP PWA requirements:
- Valid web app manifest
- App name, icons, theme color, and display mode
- HTTPS in production
- Service worker and a deliberate cache strategy
- Update handling and user-friendly update messaging
- Responsive desktop and mobile layouts
- Offline fallback and a clear offline indicator
- Test installation in supported browsers/devices

Do not promise full offline data editing in the MVP. Cache static application assets first. Keep authenticated API operations online until offline storage, synchronization, conflict handling, and data-protection behavior are intentionally designed.

## 13. Security and Privacy

Required:
- Secure password hashing
- Secure session handling and logout
- CSRF protection when using cookie-based sessions
- Deliberate CORS and cookie configuration
- Server-side validation for all inputs
- Ownership checks on every private resource
- Parameterized database queries
- Safe rendering of user-generated notes and text
- Rate limiting or other abuse protection for authentication endpoints
- Secrets stored in environment/configuration management, not committed to Git
- HTTPS
- Database backup and restore plan
- Account deletion and data export
- Error responses that do not leak secrets or stack traces

Critical authorization test: create two users and confirm that one user cannot read, update, or delete the other user's workspaces, roadmaps, notes, coding problems, applications, or interview events.

## 14. Testing Strategy

### Backend
- Unit tests for progress calculations and ownership verification
- Integration tests for repositories and database migrations
- API tests for CRUD operations
- Authentication and authorization tests
- Monthly report date-boundary tests
- Tests for empty roadmaps, archived items, and invalid weights

### Frontend
- Form validation tests
- Loading, empty, and error state tests
- Responsive layout checks
- Accessibility checks
- End-to-end flows for signup, roadmap creation, and job application tracking

### Acceptance scenarios
1. A new user can register and access a private dashboard.
2. The user can create a DSA roadmap and add unlimited topics.
3. A topic can contain multiple problems, notes, and resources.
4. Progress and elapsed-day values update correctly.
5. An application can have multiple interview events and outcomes.
6. Monthly reports use application dates and interview-event dates correctly.
7. The PWA can be installed in supported browsers.
8. One user cannot access another user's data.
9. The app handles validation failures and network errors gracefully.

## 15. Development Milestones

Estimated effort is approximate for one developer; the schedule depends on available hours and prior experience.

### Milestone 1 — Project foundation (2–3 days)
- Create repositories and project structure
- Configure React, TypeScript, Vite, Tailwind
- Create Spring Boot project
- Configure PostgreSQL and Flyway
- Set up environment variables and health checks

### Milestone 2 — Authentication and ownership (3–4 days)
- Registration, login, logout
- Password hashing and session management
- Protected APIs
- Ownership and authorization tests

### Milestone 3 — Workspace and dashboard (3–4 days)
- Main layout and navigation
- Workspace CRUD
- Dashboard summary endpoint
- Loading, empty, and error states

### Milestone 4 — Roadmaps and topics (4–5 days)
- Roadmap and topic CRUD
- Ordering and statuses
- Dates and deadlines
- Progress calculation service

### Milestone 5 — Notes and coding practice (4–6 days)
- Notes editor
- Problems and saved solutions
- Difficulty and status
- Resource links and search
- Complete and verify the recommended first vertical slice before broadening scope

### Milestone 6 — Basic job tracker (4–5 days)
- Application CRUD, table, filters, and statuses
- Interview events and history
- Monthly application reporting using typed core fields

### Milestone 7 — Analytics and reporting (3–5 days)
- Dashboard calculations & metrics
- Monthly job pipeline conversion reports
- Integration and authorization tests
- System performance optimization

### Milestone 8 — PWA and deployment (3–4 days)
- Manifest, icons, service worker
- Update handling
- HTTPS deployment
- Production database and environment configuration

### Milestone 9 — Polish and release (2–4 days)
- Responsive and accessibility checks
- Error handling
- Export/backup verification
- README, screenshots, and demo data

A reasonable initial target is approximately 6–10 weeks of part-time development.

## 16. Recommended First Vertical Slice

Do not build every module before testing the architecture. Start with this end-to-end flow:

1. Register a user.
2. Create a workspace.
3. Create a DSA roadmap.
4. Add an ArrayList topic.
5. Add one coding problem and one note.
6. Mark the topic complete (or complete a task if task-based progress is selected); keep problem status distinct from topic completion.
7. Calculate topic/roadmap progress.
8. Show updated progress on the dashboard.

This proves authentication, ownership, database relationships, CRUD operations, progress logic, and dashboard integration before the rest of the product is built. Treat this as the first end-to-end release gate.

## 17. Risks and Design Decisions

### Risk: progress calculations become inconsistent
Mitigation: implement one backend calculation service and document how empty, archived, skipped, and weighted items behave.

### Risk: cross-user data exposure
Mitigation: enforce ownership checks in every service and test with multiple accounts.

### Risk: offline behavior is unreliable
Mitigation: start with cached static assets and offline fallback; defer offline editing and synchronization.

### Risk: scope grows beyond a deliverable project
Mitigation: keep AI, team collaboration, automated job collection, and complex automation outside the MVP.

## 18. Future Enhancements

After the MVP is stable, consider:
- Customizable dashboard widgets
- Daily planner and reminders
- Revision scheduling / spaced repetition
- Global full-text search improvements
- Export to CSV, Markdown, and PDF
- Import/export of roadmaps and notes
- More flexible status workflows
- AI-assisted note organization and search
- Optional browser/mobile notifications
- Carefully designed offline access and synchronization
- Team collaboration and shared workspaces, with explicit permissions

## 19. Product Definition of Done

The MVP is ready when:
- The core user journeys work end to end.
- Database migrations can build a clean database.
- Authentication and ownership tests pass.
- Progress and reporting semantics are documented and tested.
- PWA installation works in supported browsers.
- The application is responsive and has useful loading/error/empty states.
- Secrets are not committed to source control.
- Production backups and restoration procedures are documented.
- The README explains setup, architecture, environment variables, tests, and deployment.

---

# Appendix A — AI Coding Assistant / Project Generation Prompt

Copy the following prompt into your coding assistant when you are ready to begin implementation. Use it to guide the project incrementally rather than asking the tool to generate the entire application in one unreviewed step.

---

You are a senior full-stack software architect and implementation partner. Help me build **LifeStack**, a secure, customizable, multi-user personal productivity platform.

## Product objective
Build a responsive, installable PWA where users can manage learning roadmaps, topics, coding problems, notes, resources, tasks, progress timelines, job applications, interview rounds, and analytics. Users must be able to sign up and their data must remain private to their account.

## Technology constraints
- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router.
- Server state: TanStack Query.
- Forms: React Hook Form and Zod.
- Backend: Java, Spring Boot, Maven, Spring Web, Spring Security, Spring Data JPA/Hibernate, Bean Validation.
- Database: PostgreSQL.
- Database migrations: Flyway.
- PWA: Vite PWA tooling, manifest, service worker, HTTPS deployment.
- Tests: JUnit, Spring Boot Test, and suitable frontend/component/end-to-end tests.
- Architecture: modular monolith; do not introduce microservices for the MVP.

## Product modules
1. Authentication and user profile.
2. Workspaces and dashboard.
3. Learning roadmaps and ordered topics.
4. Tasks and progress calculations.
5. Coding problems with difficulty, statements, solutions, language, approach, and complexity.
6. Notes, tags, resources, and record links.
7. Job applications with source, URL, application date, configurable status, salary, and notes.
8. Interview events with dates, round types, outcomes, and feedback.
9. Dashboard and monthly analytics.
10. PWA installation and a scoped offline fallback.

## Core product behavior
- Roadmaps can contain unlimited topics.
- Topics can contain unlimited tasks, coding problems, notes, and resources.
- A completed roadmap remains accessible for revision.
- Progress modes: topic-based, task-based, and weighted.
- Calculate progress in a backend service; handle empty roadmaps and archived/skipped items explicitly.
- Distinguish creation date, start date, target date, completion date, and last update.
- A job application represents one vacancy/application, not just a company.
- An application can have multiple interview events and a history of status changes.
- Monthly application reports use application dates; interview reports use event dates.

## Security requirements
- Hash passwords securely.
- Prefer a same-site deployment with `/api/*` reverse-proxied to the backend so cookie-based sessions remain first-party.
- Do not assume cross-site cookies work reliably just because `SameSite=None; Secure` is configured.
- If a same-site proxy/shared custom domain is not feasible, document and test an alternative using short-lived access tokens held in memory and a carefully secured refresh mechanism.
- Configure CSRF, CORS, cookie settings, session expiration, and logout correctly.
- Derive the current user from the authenticated principal; never trust a client-supplied owner ID.
- Check ownership for every private read, create, update, and delete operation.
- Validate inputs on the server.
- Use DTOs rather than exposing persistence entities directly.
- Use foreign keys, indexes, transactions, parameterized queries, and Flyway migrations.
- Do not commit secrets.
- Test that one account cannot access another account's records.

## UI requirements
Create a polished, accessible, responsive SaaS interface with:
- Persistent sidebar navigation
- Dashboard summary cards and recent activity
- Roadmap cards and topic details
- Coding problem lists and solution editor
- Notes library
- Job application table and pipeline cards
- Application detail timeline and interview events
- Analytics charts and date filters
- Settings and account management
- Useful loading, empty, validation, error, and offline states

Use consistent components, sensible spacing, accessible labels, keyboard support, and mobile-responsive layouts. Avoid fake functionality and placeholder actions that look finished but do nothing.

## Specification authority and implementation rules
Treat this attached LifeStack Project Documentation as the authoritative product specification, not optional background reading. Follow Section 16 (Recommended First Vertical Slice) and this Appendix A's implementation rules exactly unless I explicitly approve a change. If this prompt and the document appear to conflict, stop and identify the conflict instead of silently choosing one.

1. Begin by inspecting the existing repository and reporting its current state, if one exists.
2. Before implementation, produce a concise architecture plan, ER diagram, initial schema, endpoint list, and milestone checklist.
3. Implement in small, reviewable vertical slices. The first end-to-end slice must follow Section 16: register → workspace → DSA roadmap → ArrayList topic → one coding problem and one note → mark the topic complete (or complete a task for task-based progress) → calculate progress → show updated dashboard progress. Do not assume that marking a coding problem solved automatically completes its topic.
4. Before each milestone, list files to create/change and the acceptance criteria.
5. Write migrations before relying on new database structures.
6. Add backend and frontend tests alongside features.
7. Run available tests/builds and report actual results; never claim tests passed without running them.
8. Keep configuration in environment variables or safe configuration files.
9. Explain important architectural decisions and tradeoffs.
10. Do not generate the entire application in one huge step. Stop at a working milestone and summarize what is complete, what is tested, and what comes next.
11. Ask a concise clarification only when a decision is genuinely blocking; otherwise use the defaults in this specification and state assumptions.
12. Keep the code understandable for a developer learning full-stack development.
13. Follow the milestone order in Section 15: complete roadmaps, notes, coding practice, and job-tracker pipeline.
14. For Milestone 1, list the files you propose to create or change before creating them. Do not begin feature implementation until the ER diagram, schema/migration plan, endpoint outline, and acceptance checklist have been presented and reviewed.
15. Do not silently omit, reinterpret, or replace requirements from this document. If a requirement is technically infeasible or unsafe, explain the issue and propose a specific alternative for approval.

## First task
Start with **Milestone 1: project foundation and architecture**. Do not build all modules yet.

Deliver:
- Proposed repository and package structure using the LifeStack name
- ER diagram that includes users, workspaces, learning entities, and job applications
- First Flyway migration plan and initial schema constraints/indexes
- Endpoint list for the foundation milestone
- Spring Boot dependencies and configuration outline
- React/Vite/Tailwind/PWA setup outline
- Deployment/authentication topology decision, including whether `/api/*` will be reverse-proxied
- Environment variable example file with placeholder values only
- Local development and test instructions
- A checklist for verifying that the frontend starts, backend starts, and PostgreSQL connection works

Then implement only the foundation and verify it before moving to authentication.

---

**End of document.**
