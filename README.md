# MiraiGo Admin

MiraiGo Admin is the internal management console for operating MiraiGo content and users.

## Responsibilities

- User management for admin and learner accounts
- Content maintenance workflows for grammar, vocabulary, kanji, reading, and listening sections
- Operational control for published learning resources

## Tech Stack

- **Next.js 16**
- **TypeScript**
- **Material UI**
- **TanStack Query**
- **Tailwind CSS**

## Key Capabilities

- Route-driven course management screens
- CRUD dialogs for all hierarchy levels
- API-first architecture connected to MiraiGo Backend

## Project Structure

```text
src/
  app/                      # Route entries (courses, users, login, ...)
  components/modules/       # Feature modules for admin screens
  components/common/        # Shared admin dialogs and controls
  lib/                      # API client, query keys, shared types
```

## Integration Note

MiraiGo Admin depends on `nihongo-master-be` for authentication, course APIs, and user APIs.  
No backend service is hosted inside this repository.
