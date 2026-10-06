# DevFlow Architecture Documentation

## System Overview

DevFlow is a full-stack developer collaboration and issue tracking platform designed with high modularity, layered separation of concerns, and production-grade security and real-time capability.

```
┌──────────────────────────────────────────────────────────────────┐
│                      Client Layer (React + Vite)                 │
│  - React Router v6        - TanStack Query v5    - Tailwind CSS  │
│  - Socket.IO Client       - Context Providers    - Drag & Drop   │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ HTTP / REST & WebSockets
┌─────────────────────────────────▼────────────────────────────────┐
│                   API Gateway / Express Server                   │
│  - Security Headers (Helmet)      - Rate Limiting                │
│  - CORS                           - Cookie Parser / JWT Auth     │
│  - Global Error Handler           - Swagger / OpenAPI Docs       │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│                     Layered Backend System                       │
│                                                                  │
│   Routes ──► Controllers ──► Services ──► Repositories           │
│                                │                 │               │
│                                ▼                 ▼               │
│                          Socket.IO / Redis    Prisma ORM         │
└────────────────────────────────┬─────────────────┬───────────────┘
                                 │                 │
                                 ▼                 ▼
                          ┌─────────────┐   ┌─────────────┐
                          │    Redis    │   │ PostgreSQL  │
                          │ Cache/PubSub│   │  Database   │
                          └─────────────┘   └─────────────┘
```

---

## Architectural Principles

1. **Clean Layered Architecture**:
   - **Routes**: Map HTTP endpoints to controllers and attach Zod validation & auth middleware.
   - **Controllers**: Handle HTTP request extraction, status codes, and delegation to domain services.
   - **Services**: Enforce core business rules, trigger real-time socket broadcasts, and record audit activity logs.
   - **Repositories**: Encapsulate all database interaction using Prisma ORM.

2. **Authentication & Token Rotation**:
   - **Access Tokens**: Short-lived JWTs (15 minutes) passed via Bearer headers or HTTP-only cookies.
   - **Refresh Tokens**: Long-lived tokens (7 days) stored securely in the database with token rotation and revocation support.
   - **Password Security**: Hashed using `bcrypt` with salt rounds = 12.

3. **Role-Based Access Control (RBAC)**:
   - Organization-level roles: `OWNER`, `ADMIN`, `MEMBER`.
   - Project-level roles: `LEAD`, `DEVELOPER`, `VIEWER`.
   - Authorization middleware verifies caller permissions dynamically on every restricted route.

4. **Real-time WebSockets & Rooms**:
   - Socket.IO server authenticated via JWT handshake.
   - Scoped rooms: `org:<orgId>`, `project:<projectId>`, `issue:<issueId>`, `user:<userId>`.
   - Live events for issue updates, Kanban card movement, comment posts, and direct user notifications.

5. **GitHub Integration**:
   - Webhook endpoint receiving push and pull-request events.
   - Intelligent key parser linking commit messages (e.g., `Fixes DEV-102`) to DevFlow issues.
   - REST integration to display commit history and repository status.
