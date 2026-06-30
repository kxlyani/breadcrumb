# Breadcrumb — Day 1 Notes

**Date:** June 30, 2026

---

# Goal

Set up the foundation of the Breadcrumb backend using a production-style architecture instead of jumping straight into features.

Tech Stack:

* React + Vite + TypeScript
* Fastify
* Prisma 7
* PostgreSQL (Docker)
* Redis (Docker)

---

# What I Built

## Infrastructure

* Configured Docker containers for PostgreSQL and Redis.
* Connected Prisma to PostgreSQL.
* Created the first Prisma schema.
* Generated and applied the first migration.
* Verified the database using Prisma Studio.

Current architecture:

```
React
   ↓
Fastify
   ↓
Prisma
   ↓
PostgreSQL
```

Redis is running but not yet integrated.

---

# Database Models

Created:

* User
* Workspace
* WorkspaceMember
* ApiToken

These models form the core of the authentication and workspace system.

---

# Backend Folder Structure

Created a scalable backend architecture.

```
src
├── config
├── infra
│   ├── db
│   └── logger
├── middleware
├── modules
│   └── auth
├── server.ts
└── app.ts
```

### Why?

Instead of putting everything inside one file, responsibilities are separated.

* server.ts → Starts the server
* app.ts → Builds the Fastify application
* modules → Business features
* infra → Shared infrastructure
* middleware → Authentication, authorization, etc.

---

# Layered Architecture

Request Flow:

```
Route
    ↓
Service
    ↓
Prisma
    ↓
Database
```

Responsibilities:

### Routes

* Handle HTTP requests.
* Validate input.
* Return responses.

### Services

* Business logic.
* Authentication rules.
* Database operations.

### Prisma

* Communicates with PostgreSQL.

---

# Configuration

Used Zod to validate environment variables.

Important variables:

* DATABASE_URL
* REDIS_URL
* JWT_SECRET
* JWT_EXPIRES_IN
* PORT
* NODE_ENV

### Why validate env variables?

Fail Fast Principle.

If configuration is invalid, the application crashes immediately instead of failing later in production.

---

# Logging

Used Pino.

Why not console.log?

Pino provides:

* log levels
* timestamps
* structured logs
* production-friendly logging

Development uses `pino-pretty` for readable logs.

---

# Prisma Client

Created a singleton Prisma client.

Why?

Creating multiple Prisma clients creates unnecessary database connections.

Pattern:

```
Entire Application
        ↓
Single Prisma Client
        ↓
Connection Pool
        ↓
PostgreSQL
```

---

# Authentication Module

Created:

* auth.schema.ts
* auth.service.ts
* auth.routes.ts
* auth.middleware.ts

Even though implementation is incomplete, the structure is ready.

---

# Request Validation

Used Zod schemas.

Benefits:

* Validates requests before business logic runs.
* Returns consistent validation errors.
* Prevents invalid data from reaching the database.

---

# Password Hashing

Used bcrypt.

Never store plaintext passwords.

Flow:

```
Password
    ↓
bcrypt.hash()
    ↓
Store passwordHash
```

---

# Timing Attack Prevention

During login:

Even if a user does not exist, bcrypt comparison is still executed.

Reason:

Prevents attackers from determining whether an email exists based on response time.

---

# JWT Authentication

Configured Fastify JWT.

Authentication flow:

```
Login
    ↓
Generate JWT
    ↓
Client stores token
    ↓
Future requests send token
    ↓
Server verifies token
```

---

# Middleware

Purpose:

Run logic before routes.

Examples:

* Verify JWT
* Check permissions
* Rate limiting
* Logging

Current middleware:

* Authentication

---

# Health Check

Added:

```
GET /health
```

Purpose:

Allows monitoring tools, Docker, Kubernetes, and load balancers to determine whether the server is healthy.

---

# Global Error Handler

Centralized all unexpected errors.

Benefits:

* Consistent API responses
* Centralized logging
* Hide internal errors in production

---

# Shared Types

Created shared package:

```
packages/types
```

Shared interfaces:

* AuthResponse
* RegisterInput
* LoginInput
* WorkspaceResponse
* ApiSuccess
* ApiError
* PaginatedResponse

Benefit:

Frontend and backend use the same contracts, reducing duplication and preventing type drift.

---

# Testing Setup

Prepared:

* Vitest
* Supertest

Purpose:

Integration tests that verify the complete request lifecycle.

---

# Important Backend Concepts Learned

* Layered architecture
* Separation of concerns
* Fail Fast Principle
* Environment validation
* JWT authentication
* Password hashing
* Timing attack prevention
* Singleton pattern
* Middleware
* Request validation
* Global error handling
* Structured logging
* Shared types in a monorepo
* Prisma ORM basics
* Database migrations

---

# Problems Encountered

* Prisma 7 logging API differs from older tutorials.
* Modern TypeScript treats caught errors as `unknown`.
* Some tutorial code targets slightly older versions of Fastify/Prisma.

Lesson:

Do not blindly copy tutorials. Understand the underlying concept and adapt it to the library versions being used.

---

# Interview Questions to Revise

* Why use a service layer?
* Why validate environment variables at startup?
* Why hash passwords instead of storing them?
* Why use JWT?
* What is middleware?
* Why use a singleton Prisma client?
* What is the purpose of a health endpoint?
* Why separate `server.ts` and `app.ts`?
* What is the difference between validation and business logic?
* Why share TypeScript types between frontend and backend?

---

# Day 1 Summary

Today was about building the foundation rather than features.

I now have a backend with:

* A production-style project structure
* Database integration
* Configuration management
* Logging
* Authentication scaffolding
* Shared types
* Global error handling
* A clear architecture that can scale as Breadcrumb grows

The next step is to complete authentication, write integration tests, and start building the Workspace module.
