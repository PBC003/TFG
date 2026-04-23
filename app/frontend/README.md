# Frontend — Quiz Platform Client

## Purpose
This package contains the frontend client for the TFG quiz platform.
It provides the user interfaces for authentication, question-bank management, quiz creation, student quiz access, history, analytics, profile pages, admin-oriented flows and group management.

The frontend is implemented with **React + TypeScript + Vite** and uses **Material UI** as the main component library.
Mathematical content is rendered with **KaTeX** and the application includes **i18n** support through `i18next`.

## Main areas
The current source tree is organized around route-level pages, reusable components and a service layer:

```text
src/
├── components/        # Reusable UI and shared feature components
├── constants/         # Frontend configuration constants
├── context/           # Application context providers
├── hooks/             # Shared hooks
├── i18n/              # Internationalization setup and resources
├── pages/
│   ├── admin/         # Admin pages
│   ├── groups/        # Group-lite management
│   ├── profile/       # User profile views
│   ├── questions/     # Question bank UI
│   ├── quiz-access/   # Student quiz access and catalog views
│   ├── quiz-history/  # Attempt history pages
│   └── quizzes/       # Quiz builder, analytics and related pages
├── router/            # Route configuration
├── services/          # API communication layer by domain
├── types/             # Shared TS types
└── utils/             # Generic frontend utilities
```

## Functional scope covered by the client
- Login and authenticated navigation.
- Role-aware application layout.
- Question creation, editing, archiving and filtering.
- LaTeX/KaTeX rendering and preview.
- Parametric-question authoring UI for the supported bounded templates.
- Quiz builder and publication flow.
- Student access to available quizzes.
- Attempt review and history.
- Teacher analytics and attempt drill-down.
- Group-lite management with manual and bulk member import.
- Teacher/admin quiz simulation-preview.

## Frontend configuration
The client reads the API base URL from Vite environment variables.

### Relevant variable
```env
VITE_API_BASE_URL=http://localhost:3001
```

If the variable is not defined, the code falls back to:
- `http://localhost:3001`

## Installation
```bash
npm install
```

## Development
```bash
npm run dev
```

Default local URL:
- `http://localhost:5173`

## Production build and preview
```bash
npm run build
npm run preview
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

### Tests / coverage
There is no dedicated npm script for Vitest at the moment, so the usual command is:

```bash
npx vitest run --coverage
```

## Docker support
The frontend package now includes a dedicated multi-stage Docker build.

### Included files
- `Dockerfile`
- `.dockerignore`
- `nginx.conf`

### Runtime behavior inside Docker
- The application is built with Vite.
- The static bundle is served by **Nginx**.
- `/api/*` requests are proxied by Nginx to the backend container.
- SPA routing is handled with an `index.html` fallback.

### Docker build argument
```env
VITE_API_BASE_URL=/api
```

This is the value used by the root `docker-compose.yml`, allowing the browser to talk to the backend through the same frontend origin.

## UI and architectural notes
- Routing is handled with `react-router-dom`.
- UI components are primarily built with Material UI.
- Mathematical rendering uses KaTeX.
- Internationalization resources are stored under `src/i18n/resources`.
- API access is centralized in `src/services`, split by domain (`auth`, `questions`, `quizzes`, `groups`, `admin`, etc.).

## Related documentation
- Root repository README: `../../README.md`
- Backend README: `../backend/README.md`
- ADRs: `../../docs/adrs/`
- Requirements: `../../docs/requirements/`
- Use cases: `../../docs/use cases/`
