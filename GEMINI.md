# API Treino Smart - Project Context

## Project Overview
A Node.js REST API for managing smart workout plans, built with TypeScript, Fastify, and Prisma. The system supports user authentication, workout plan creation with nested days and exercises, and session management.

### Tech Stack
- **Runtime:** Node.js (v24.x)
- **Language:** TypeScript
- **Web Framework:** [Fastify](https://fastify.io/) (v5.7) with `fastify-type-provider-zod`
- **ORM:** [Prisma](https://www.prisma.io/) (v7.4) with PostgreSQL
- **Authentication:** [Better Auth](https://www.better-auth.com/) (v1.4)
- **Validation:** [Zod](https://zod.dev/)
- **Documentation:** Swagger/OpenAPI (via `@fastify/swagger`) with Scalar API Reference

## Building and Running
### Prerequisites
- Node.js (v24.x)
- pnpm (v10.x)
- PostgreSQL database

### Key Commands
- `pnpm install`: Install dependencies.
- `pnpm run dev`: Start development server with `tsx --watch`.
- `pnpx prisma migrate dev`: Apply database migrations.
- `pnpx prisma generate`: Regenerate Prisma client (output to `src/generated/prisma`).
- `docker-compose up`: (Optional) Start infrastructure services if defined.

## Project Structure
- `src/index.ts`: Main entry point, Fastify configuration, and plugin registration.
- `src/routes/`: Route handlers. Uses Zod for type-safe requests/responses.
- `src/usecases/`: Business logic layer. Classes that perform specific operations (e.g., `CreateWorkoutPlan`).
- `src/lib/`: Core singleton instances:
  - `db.ts`: Prisma database client.
  - `auth.ts`: Better Auth configuration.
- `src/schemas/`: Shared Zod schemas for validation and API documentation.
- `src/errors/`: Custom error classes (e.g., `NotFoundError`).
- `prisma/`: Database schema and migrations.

## Development Conventions
### 1. Type-Safe Routing
Routes should use `app.withTypeProvider<ZodTypeProvider>().route()` to ensure tight integration with Zod schemas for both request bodies and responses.

### 2. Use Case Pattern
Encapsulate business logic in Use Case classes within `src/usecases/`.
- Use local `InputDto` and `OutputDto` interfaces.
- Handle database operations within transactions (`prisma.$transaction`) when involving multiple steps to ensure consistency.

### 3. Database Access
Always import `prisma` from `../lib/db.js` (or relative path). Do not instantiate new Prisma clients in use cases or routes.

### 4. Authentication
- Session verification should be performed in the route handler using `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })`.
- Pass `userId` from the session to the use cases.

### 5. Error Handling
- Use custom errors from `src/errors/` for domain-specific failures.
- Map these errors to appropriate HTTP status codes in the route's `handler` catch block.
- Always include `ErrorSchema` in the route's `response` schema for 4xx/5xx errors.

### 6. Imports
Adhere to `eslint-plugin-simple-import-sort` conventions:
1. Standard/Third-party imports.
2. Project-relative imports (e.g., `../`, `./`).
