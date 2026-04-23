# Backend — Quiz Platform API

## Purpose
This package contains the backend API for the TFG quiz platform.
It provides authentication, user-related operations, question bank management, quiz lifecycle management, student access to quizzes, grading, history, analytics, export-oriented endpoints and group management helpers.

The backend is implemented with **NestJS + TypeScript** and combines:
- a **relational persistence layer** for authentication and user-oriented data;
- a **MongoDB document layer** for questions, quizzes, attempts and related academic flows.

## Main domains
The current source tree is organized around these main areas:

```text
src/
├── auth/         # Login, JWT/session flow, guards and auth utilities
├── common/       # Shared filters, app errors and utilities
├── database/     # TypeORM data source and migrations
├── groups/       # Group-lite management and member import
├── questions/    # Question bank, schemas, validators and helpers
├── quizzes/      # Quiz builder, access flow, attempts, analytics and export
└── users/        # User entities, DTOs and user-related logic
```

## Relevant functional responsibilities
- User authentication and session handling.
- Teacher/admin authorization boundaries.
- CRUD-style management of questions and quizzes.
- Support for several question types, including **bounded parametric questions**.
- Attempt creation, grading and review.
- Student history retrieval.
- Teacher analytics and CSV export.
- Group-lite ownership, assignment and bulk import flows.
- Teacher/admin simulation-preview support for quizzes.

## Environment configuration
Use `app/backend/.env.example` as the baseline configuration for local development.

### Minimum local variables
```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_LOGGING=false

JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

AUTH_REFRESH_COOKIE_NAME=refresh_token
FRONTEND_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax

MONGO_URI=mongodb://localhost:27017/tfg_questions
MONGO_AUTO_INDEX=false
```

### Notes
- `FRONTEND_URL` must match the frontend origin used during local development.
- The MongoDB connection is required for the question bank, quiz and attempt domains.
- The relational database is required for authentication and user-related data.
- Database schema changes are applied through TypeORM migrations, not through `synchronize`.

## Installation
```bash
npm install
```

## Development
```bash
npm run migration:run
npm run start:dev
```

Default local URL:
- `http://localhost:3001`

## Production build
```bash
npm run build
npm run start:prod
```

## Quality and testing commands
### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Unit/integration-oriented tests
```bash
npm run test
npm run test:cov
npm run test:e2e
```

## Database and migration commands
```bash
npm run migration:create
npm run migration:generate
npm run migration:run
npm run migration:revert
```

These commands apply only to the relational database side managed through TypeORM.

## Docker support
The backend package now includes a dedicated Docker image and runtime helper scripts.

### Included files
- `Dockerfile`
- `.dockerignore`
- `scripts/docker-entrypoint.sh`
- `scripts/run-migrations.js`
- `scripts/seed-admin.js`

### Runtime behavior inside Docker
When the backend container starts, it:
1. runs pending relational migrations,
2. optionally seeds or promotes an admin user if `SEED_ADMIN=true`,
3. starts the compiled NestJS application.

### Important environment variables for Docker
```env
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=tfg
DB_USER=tfg
DB_PASSWORD=tfg
MONGO_URI=mongodb://mongodb:27017/tfg_questions
FRONTEND_URL=http://localhost:8080
SEED_ADMIN=true
SEED_ADMIN_EMAIL=uo000001@uniovi.es
SEED_ADMIN_PASSWORD=Admin123!
```

The canonical root-level entry point for the full containerized stack is `../../docker-compose.yml`.

## Testing notes
The backend includes automated tests covering services, utilities, controllers, validation helpers and grading-related flows.
Coverage was pushed to a high level during the hardening phase, but the project should still be interpreted as an academic deliverable rather than a production-hardened SaaS backend.

## Related documentation
- Root repository README: `../../README.md`
- Frontend README: `../frontend/README.md`
- ADRs: `../../docs/adrs/`
- Requirements: `../../docs/requirements/`
- Use cases: `../../docs/use cases/`
