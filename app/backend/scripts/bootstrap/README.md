# Private bootstrap content

This folder documents the **manual bootstrap flow** for private academic content that must not live in the public repository.

## Recommended private layout

Create a private directory outside Git or inside a gitignored path, for example:

```text
app/backend/private/bootstrap/
  manifest.json
  question-bank.v1.json
  parametric-templates.v1.json
```

## Run the import

From `app/backend`:

```bash
npm run bootstrap:content -- --dir ./private/bootstrap
```

## Operational notes

- The question bank import is **idempotent** and uses `seedKey` per question.
- Parametric templates can also be imported and persisted in MongoDB as **private bootstrap artefacts** for traceability and future migrations.
- **Current runtime note:** the backend still resolves parametric templates from the bundled registry in `src/questions/utils/parametric-question-template.util.ts`. Importing `parametric-templates.v1.json` does **not** switch runtime generation to MongoDB.
- The JSON files are considered **private bootstrap artefacts** and should not be committed.
