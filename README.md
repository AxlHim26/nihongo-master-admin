# nihongo-master-admin

Admin frontend for Nihongo LMS.

Backend is **not** hosted in this repo anymore.
Use `nihongo-master-be` as API server.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Edit `.env`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_BYPASS_ADMIN_AUTH=false
```

4. Run admin frontend:

```bash
npm run dev
```

If you only need to preview UI without login, set:

```
NEXT_PUBLIC_BYPASS_ADMIN_AUTH=true
```

## Modules

- Courses (tree CRUD: course -> chapter -> section -> lesson)
- Chapters
- Grammar
- Vocabulary (under development status in UI)
- Kanji
- Lessons

See detailed implementation notes: `docs/ADMIN_DASHBOARD_IMPLEMENTATION.md`.
