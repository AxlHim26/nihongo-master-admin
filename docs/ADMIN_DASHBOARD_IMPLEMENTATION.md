# Admin Dashboard Implementation Guide

## 1. Requirement Analysis

This implementation follows the required hierarchy:

`Course -> Chapter -> Section(VOCABULARY|GRAMMAR|KANJI) -> Lesson`

- Grammar: full CRUD via Section type `GRAMMAR` + lesson CRUD.
- Kanji: full CRUD via Section type `KANJI` + lesson CRUD.
- Vocabulary: module marked **UNDER_DEVELOPMENT** in UI, but schema + APIs are fully ready.

## 2. Database Design

Implemented in `nihongo-master-be` via Flyway migration:

- `courses`
- `course_chapters`
- `course_sections`
- `course_lessons`

with cascade delete and indexes for ordered tree retrieval.

## 3. API Design

Implemented admin endpoints (admin role required):

- Course:
  - `GET /api/v1/courses?tree=true`
  - `GET /api/v1/courses/:id`
  - `POST /api/v1/courses`
  - `PUT /api/v1/courses/:id`
  - `DELETE /api/v1/courses/:id`

- Chapter:
  - `GET /api/v1/chapters`
  - `POST /api/v1/courses/:id/chapters`
  - `PUT /api/v1/chapters/:id`
  - `DELETE /api/v1/chapters/:id`

- Section:
  - `GET /api/v1/sections?type=GRAMMAR|VOCABULARY|KANJI`
  - `POST /api/v1/chapters/:id/sections`
  - `PUT /api/v1/sections/:id`
  - `DELETE /api/v1/sections/:id`

- Lesson:
  - `GET /api/v1/lessons`
  - `POST /api/v1/sections/:id/lessons`
  - `PUT /api/v1/lessons/:id`
  - `DELETE /api/v1/lessons/:id`

## 4. Backend Implementation

Main files added/updated in `nihongo-master-be`:

- Entities:
  - `src/main/java/com/example/japanweb/entity/Course.java`
  - `src/main/java/com/example/japanweb/entity/CourseChapter.java`
  - `src/main/java/com/example/japanweb/entity/CourseSection.java`
  - `src/main/java/com/example/japanweb/entity/CourseLesson.java`
  - `src/main/java/com/example/japanweb/entity/CourseSectionType.java`
  - `src/main/java/com/example/japanweb/entity/CourseSectionStatus.java`

- API/Service:
  - `src/main/java/com/example/japanweb/controller/CourseStructureController.java`
  - `src/main/java/com/example/japanweb/service/CourseStructureService.java`
  - `src/main/java/com/example/japanweb/service/impl/CourseStructureServiceImpl.java`

- Migration:
  - `src/main/resources/db/migration/V6__add_course_structure_tables.sql`

- Security/auth hardening:
  - method security enabled in `SecurityConfig`
  - CORS enabled for admin frontend (`http://localhost:3001`)
  - registration bug fixed in `AuthenticationService` (email persisted + duplicate checks)

## 5. Frontend Implementation

Implemented in `nihongo-master-admin` (single Next.js app at repo root):

- Stack: Next.js + MUI + Tailwind + React Query
- Modules: Courses, Chapters, Grammar, Vocabulary, Kanji, Lessons
- UX patterns:
  - Sidebar navigation
  - Modal dialogs for Create/Edit
  - Confirm dialogs for Delete
  - React Query cache invalidation after every successful mutation

## 6. Deployment / Run Guide

### Backend (`nihongo-master-be`)

1. Run PostgreSQL + Redis
2. Start Spring Boot backend (Flyway will run V6 automatically)

### Frontend (`nihongo-master-admin`)

1. `npm install`
2. Create `.env`:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
3. `npm run dev`

### Authentication

Use backend `/api/v1/auth/authenticate` with an account that has role `ADMIN`.

## Husky + ESLint + EditorConfig

- Root pre-commit hook runs lint.
- EditorConfig included at repo root.
- Next.js lint configured in `.eslintrc.json`.

## Best Practices Applied

- Clean module separation by domain layer in backend.
- Tree-safe cascade relationships with ordered indexes.
- Stateless JWT auth with admin role checks.
- Query invalidation strategy for consistent admin CRUD UX.
- Type-safe frontend API layer and shared DTO-style client types.
