# TFG — Quiz Platform (MVP)

> Final Degree Project (TFG) — Academic year 2025/2026

## Context
This repository contains the implementation and supporting documentation for a web application aimed at creating and taking self-assessment quizzes for Calculus courses.

The project is focused on two complementary workflows:
- a **teacher workflow** for building and publishing quizzes, reviewing results and exporting data;
- a **student workflow** for accessing available quizzes, submitting attempts and reviewing their own results/history.

The application supports mathematical content rendered with **LaTeX/KaTeX**, several question types, bounded **parametric questions**, automatic grading for the supported formats, teacher analytics and CSV export.

## Contributors
| Role | Name | Contact |
|------|------|---------|
| Author | Pablo Barrero Cruz | <a href="https://github.com/PBC003"><img src="https://img.shields.io/badge/PBC003-Pablo Barrero-orange"></a> |
| Supervisor | Cristian González García | <a href="https://github.com/gonzalezgarciacristian"><img src="https://img.shields.io/badge/gonzalezgarciacristian-Cristian González-green"></a> |

> Note: The Supervisor role refers to academic supervision, not necessarily code contributions.

## Project scope (high-level)
- **Question bank** with question creation, editing, archiving and filtering.
- Support for **mathematical statements and feedback** rendered with KaTeX.
- Support for **closed-template parametric questions** with bounded automatic grading and numerical tolerance.
- **Quiz builder** for teachers, including question selection, publication flow and review settings.
- **Student quiz access flow** with attempt submission, grading and result review.
- **Attempt history** for students.
- **Teacher analytics** with summary metrics, attempt drill-down and CSV export.
- **Group-lite management** to organize subsets of students and assign quizzes.
- **Quiz simulation/preview** for teacher/admin workflows.
- Automated **backend and frontend tests** plus supporting TFG documentation.

## Repository structure

```text
TFG/
├── app/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── auth/          # Authentication and session management
│   │   │   ├── users/         # User management and admin-related services
│   │   │   ├── questions/     # Question bank domain, validation and grading helpers
│   │   │   ├── quizzes/       # Quiz builder, attempts, analytics and preview
│   │   │   └── groups/        # Group-lite management and import helpers
│   │   ├── scripts/           # Runtime helpers for migrations and demo seeding
│   │   └── test/              # Backend unit/e2e tests
│   └── frontend/
│       ├── src/
│       │   ├── pages/         # Main application pages and route-level features
│       │   ├── components/    # Reusable UI and feature-specific components
│       │   ├── services/      # API communication layer
│       │   ├── hooks/         # Shared frontend hooks
│       │   ├── context/       # Global/client state providers and auth context
│       │   ├── types/         # Shared TypeScript types
│       │   └── i18n/          # Internationalization resources
│       └── test/              # Frontend unit tests
├── docs/
│   ├── requirements/          # Requirements specification
│   ├── use cases/             # Use case documentation
│   ├── adrs/                  # Architectural Decision Records
│   ├── mm/                    # Meeting minutes
│   └── ...                    # Additional TFG support material
├── docker-compose.yml         # Full local stack (frontend, backend, MariaDB, MongoDB)
├── .env.docker.example        # Example environment file for Docker Compose
└── README.md                  # Main repository entry point
```

## Technology stack
### Frontend
- React
- TypeScript
- Vite
- Material UI
- React Router
- i18next
- KaTeX
- Nginx (containerized static delivery)

### Backend
- NestJS
- TypeScript
- TypeORM
- Mongoose
- JWT authentication
- MariaDB driver (`mysql2`)

### Persistence
- **MariaDB/MySQL-compatible relational database** for authentication, users and relational data.
- **MongoDB** for questions, quizzes, attempts and related document-oriented domains.

## Project management
Work has been tracked using:
- **GitHub Issues** for features, bugs and documentation tasks.
- **Labels** such as `type:*`, `area:*`, `priority:*`.
- **Milestones** for sprint planning.
- A **GitHub Project board** for operational status and roadmap follow-up.

## Quick start (Docker Compose)
This is now the fastest way to boot the full stack locally.

### 1. Prepare the environment file
```bash
cp .env.docker.example .env.docker
```

You can keep the defaults for a first local run or change the seeded admin credentials before starting the stack.

### 2. Build and start the stack
```bash
docker compose --env-file .env.docker up --build
```

### 3. Open the application
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3001`
- MariaDB: `localhost:3306`
- MongoDB: `localhost:27017`

### 4. Default Docker admin user
If `SEED_ADMIN=true`, the backend container creates or promotes an initial admin user on startup.

Default demo credentials from `.env.docker.example`:
- Email: `uo000001@uniovi.es`
- Password: `Admin123!`

Change them before sharing the stack outside your own machine.

### 5. Stop the stack
```bash
docker compose --env-file .env.docker down
```

To remove persisted database volumes as well:
```bash
docker compose --env-file .env.docker down -v
```

## Local development prerequisites
To run the full system without Docker you need:
- Node.js and npm
- A MariaDB/MySQL-compatible database
- MongoDB

The repository still supports standard local development for sprint work, debugging and academic review.

## Local development quick start
### 1. Backend
```bash
cd app/backend
npm install
cp .env.example .env
npm run migration:run
npm run start:dev
```

By default, the backend runs on `http://localhost:3001`.

### 2. Frontend
```bash
cd app/frontend
npm install
npm run dev
```

By default, the frontend runs on `http://localhost:5173`.

## Validation commands
### Backend
```bash
cd app/backend
npm run build
npm run test
npm run test:cov
npm run test:e2e
```

### Frontend
```bash
cd app/frontend
npm run build
npm run lint
npx vitest run --coverage
```

## CI
A minimal GitHub Actions workflow is available at `.github/workflows/ci.yml`.
It runs the frontend lint/tests/build flow and the backend lint/tests/build/e2e flow.

## Useful project areas
- Backend details: [`app/backend/README.md`](app/backend/README.md)
- Frontend details: [`app/frontend/README.md`](app/frontend/README.md)
- Requirements: `docs/requirements/`
- Use cases: `docs/use cases/`
- ADRs: `docs/adrs/`
- Meeting minutes: `docs/mm/`

## Current status
From the point of view of implementation, the agreed functional scope is already built and revalidated:
- the application is functionally closed for the approved scope;
- frontend and backend automated test suites are available;
- CI is prepared in the repository;
- Docker-based local delivery is now included;
- the main remaining academic block is the final memory/documentation consolidation.

## Deployment notes
- The Docker setup is intended for **local validation, demo and academic review**.
- The frontend container serves the SPA through Nginx and proxies `/api/*` calls to the backend container.
- The backend container runs relational migrations at startup and can optionally seed an admin user.

## Useful links
- **Key docs:**
  - MVP: `docs/mvp/`
  - Requirements: `docs/requirements/`
  - Planning & Budget: `docs/planing/`, `docs/budget/`
  - ADRs: `docs/adrs/`
  - Use cases: `docs/use cases/`
  - Meeting minutes: `docs/mm/`

## License and academic use
No open-source license has been formally assigned yet.
Until an explicit decision is made, this repository should be treated as an **academic project repository** and not as a generally licensed distribution.
