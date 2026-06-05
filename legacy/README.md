# Legacy Express + MongoDB app

This folder is the original YelpCamp tutorial-style stack (Express, EJS, Mongoose, Passport).

The active application lives at the repository root (Next.js 15 + PostgreSQL). To run the legacy app:

```bash
cd legacy
# copy env vars for DB_URL, SESSION_SECRET, etc. from repo .env.example (Mongo fields)
node app.js
```

Note: `package.json` at the repo root now targets the Next.js app; legacy dependencies are not installed by default.
