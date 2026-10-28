# LifeStack — Personal Productivity Platform

LifeStack is a customizable personal productivity platform and Progressive Web App (PWA) designed to organize learning roadmaps, topics, coding practice, notes, resources, tasks, job applications, interview stages, and progress analytics in one private, secure workspace.

## Architecture

LifeStack is designed as a **modular monolith**:
- **Frontend (`lifestack-frontend`)**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, React Router v6.
- **Backend (`lifestack-backend`)**: Java (JDK 21/24), Spring Boot 3.4, Spring Data JPA, Hibernate, Bean Validation, Spring Actuator, Flyway.
- **Database**: PostgreSQL 18 with JSONB support and Flyway versioned migrations.
- **Deployment Topology**: First-party same-site deployment via reverse proxy (`/api/*` proxied to Spring Boot).

## Project Structure

```text
LifeStack/
├── LifeStack_Project_Documentation_v1.1.md # Authoritative specification
├── lifestack-backend/                       # Spring Boot modular monolith
│   ├── src/main/java/com/lifestack/         # Application source
│   ├── src/main/resources/db/migration/     # Flyway database migrations
│   └── pom.xml                              # Maven dependencies
├── lifestack-frontend/                      # React TypeScript Vite PWA
│   ├── src/                                 # Components, features, hooks
│   ├── public/                              # PWA manifest and static assets
│   └── package.json
└── README.md
```

## Quick Start (Milestone 1 Foundation)

### Prerequisites
- JDK 21 or JDK 24
- Apache Maven 3.9+
- Node.js 20+ & npm
- PostgreSQL 15+ running on port 5432 (database: `lifestack_db`)

### 1. Database Setup
Create the PostgreSQL database if not already created:
```sql
CREATE DATABASE lifestack_db;
```

### 2. Backend Setup
Navigate to `lifestack-backend`:
```bash
cd lifestack-backend
# Copy environment variables template
cp .env.example .env
# Run tests and start application
mvn clean test
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.
Verify health:
```bash
curl http://localhost:8080/api/v1/health
```

### 3. Frontend Setup
Navigate to `lifestack-frontend`:
```bash
cd lifestack-frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.
All requests to `/api/*` are automatically proxied to the backend on `http://localhost:8080`.

