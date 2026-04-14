# TFG — Quiz Platform (MVP)

> Final Degree Project (TFG) — Academic year 2025/2026

## Context
This repository contains the work for my Final Degree Project (TFG).
The project focuses on designing and building a web application for creating and taking quizzes, with support for mathematical content (LaTeX), automatic grading for the supported question types, and a teacher-oriented workflow for publishing and reviewing quizzes.

At the current stage, the project already includes:
- a **question bank** with support for LaTeX rendering and preview,
- a **quiz builder** for teachers,
- a **student attempt flow** with grading,
- and the supporting documentation, tests and project-management artifacts developed during the sprints.

## Contributors
| Role | Name | Contact |
|------|------|---------|
| Author | Pablo Barrero Cruz | <a href="https://github.com/PBC003"><img src="https://img.shields.io/badge/PBC003-Pablo Barrero-orange"></a>  |
| Supervisor | Cristian González García | <a href="https://github.com/gonzalezgarciacristian"><img src="https://img.shields.io/badge/gonzalezgarciacristian-Cristian González-green"></a>|

> Note: The Supervisor role refers to academic supervision (not necessarily code contributions).

## Project scope (high-level)
- **Question bank**: create, edit and manage question items, including mathematical content rendered with LaTeX.
- **Quizzes**: teachers assemble quizzes from the question bank, configure attempts/timing/basic visibility rules, and publish or unpublish them.
- **Attempts & grading**: authenticated students access available quizzes, submit attempts and receive the corresponding grading/feedback according to the configured rules.
- **Analytics**: basic teacher analytics and export capabilities are planned as a later project block.

## Repository structure

```text
TFG/
├── app/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── auth/          # Authentication and session management
│   │   │   ├── users/         # User management and admin-related services
│   │   │   ├── questions/     # Question bank domain, validation and grading helpers
│   │   │   └── quizzes/       # Quiz builder, attempts and quiz access flow
│   │   └── test/              # Backend unit/integration tests
│   └── frontend/
│       ├── src/
│       │   ├── pages/         # Main application pages and route-level features
│       │   ├── components/    # Reusable UI and feature-specific components
│       │   ├── services/      # API communication layer
│       │   ├── hooks/         # Shared frontend hooks
│       │   ├── stores/        # Global/client state management
│       │   ├── types/         # Shared TypeScript types
│       │   └── i18n/          # Internationalization resources
│       └── test/              # FrontEnd unit tests
├── docs/
│   ├── requirements/          # Requirements specification
│   ├── use cases/             # Use case documentation
│   ├── adrs/                  # Architectural Decision Records
│   ├── mm/                    # Meeting minutes
│   └── ...                    # Additional TFG support material
└── README.md                  # Main repository entry point
```

## Project management
We track work using:
- **GitHub Issues** (features/tasks/bugs/docs)
- **Labels**: `type:*`, `area:*`, `priority:*`
- **Milestones**: `Sprint X - ...`
- **GitHub Project board** for status/roadmap

## Useful links
- **GitHub Project board:** [LINK_TO_GITHUB_PROJECT]
- **Key docs:**
  - MVP: `docs/mvp/`
  - Requirements: `docs/requirements/`
  - Planning & Budget: `docs/planing/`, `docs/budget/`
  - ADRs: `docs/adrs/`
  - Use cases: `docs/use cases/`
  - Meeting minutes: `docs/mm/`

## Quick start
### 1. Backend
```bash
cd app/backend
npm install
cp .env.example .env
npm run start:dev
```

By default, the backend runs on `http://localhost:3001`.

The backend uses:
- a relational database connection for the authentication/user area,
- and MongoDB for the question bank and quiz/attempt domains.

### 2. Frontend
```bash
cd app/frontend
npm install
npm run dev
```

By default, the frontend runs on `http://localhost:5173`.

### 3. Useful validation commands
**Backend**
```bash
cd app/backend
npm run build
npm run test
npm run test:cov
```

**Frontend**
```bash
cd app/frontend
npm run build
npm run lint
```

## Deployment (current status)
A final production deployment strategy is not closed yet.  
At this stage, the project is prepared and documented mainly for local development, academic review and sprint-based validation.

## License
Pending decision according to the academic delivery context.
