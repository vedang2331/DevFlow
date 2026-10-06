# 🚀 DEVFLOW — Developer Collaboration & Issue Tracking Platform

> A production-quality, full-stack developer collaboration and issue tracking platform combining the best capabilities of **Jira**, **GitHub Issues**, and **Trello**. Designed with a clean layered architecture, real-time WebSocket updates, multi-tenant RBAC security, and automated GitHub webhook integration.

---

## 📸 Platform Highlights & Features

- 🏢 **Multi-Tenant Workspaces & RBAC**: Organization & Project level security (`OWNER`, `ADMIN`, `MEMBER`, `LEAD`, `DEVELOPER`, `VIEWER`).
- 📌 **Custom Issue Identifiers**: Auto-generated keys per project (e.g. `DEV-101`, `DEV-102`).
- 📋 **Interactive Kanban Board**: Dynamic drag-and-drop column sorting with instant Socket.IO broadcasts across connected users.
- ⚡ **Real-time WebSockets & Redis**: Socket.IO room subscriptions (`project:<id>`, `issue:<id>`, `user:<id>`) for live comments, status changes, and notification alerts.
- 🔐 **Token Rotation & Security**: 15-minute JWT Access Tokens with HTTP-only 7-day SHA-256 Refresh Token rotation and session revocation.
- 🐙 **GitHub Integration & Webhooks**: Live commit timeline, pull requests, and automated issue resolution when commit messages match keywords (e.g., `Fixes DEV-102`).
- 🔍 **Advanced Search & Filtering**: Multi-field backend search (title, description, key, status, priority, type, labels) with page-based pagination.
- 📖 **Swagger / OpenAPI 3.0 Documentation**: Complete API endpoint spec available at `/api-docs`.

---

## 🛠 Tech Stack

### Backend Architecture
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js (Modular layered architecture: `Routes` ➔ `Controllers` ➔ `Services` ➔ `Repositories` ➔ `Prisma`)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Real-Time WebSockets**: Socket.IO
- **Caching / Session Support**: Redis (`ioredis` with graceful fallback)
- **Authentication**: JWT & `bcryptjs`
- **Validation**: Zod
- **Testing**: Vitest & Supertest
- **API Documentation**: Swagger UI & OpenAPI 3.0

### Frontend Architecture
- **Framework**: React 18 & TypeScript (Vite)
- **Styling**: Tailwind CSS (SaaS dark mode design system)
- **State Management**: TanStack Query (React Query v5) & React Context
- **Routing**: React Router v6
- **Drag and Drop**: `@hello-pangea/dnd`
- **Icons**: Lucide React

### DevOps & Infrastructure
- **Containerization**: Docker & Multi-stage Docker Compose
- **CI/CD**: GitHub Actions

---

## 🏗 Backend Architecture & Directory Structure

```
server/
├── src/
│   ├── config/          # Environment vars, Prisma, Redis clients
│   ├── controllers/     # HTTP request handlers & status mapping
│   ├── services/        # Core business rules, socket emissions, audit logs
│   ├── repositories/    # Data access layer interfacing Prisma ORM
│   ├── middleware/      # Auth, RBAC, Zod validation, error handler
│   ├── routes/          # Express route definitions
│   ├── sockets/         # Socket.IO room manager & event broadcaster
│   ├── integrations/   # GitHub REST client & webhook parser
│   ├── validators/      # Zod validation schemas
│   ├── types/           # Express & Auth TypeScript interfaces
│   ├── app.ts           # Express application setup
│   └── server.ts        # HTTP server & WebSocket boot
├── prisma/
│   ├── schema.prisma    # Complete PostgreSQL schema
│   └── seed.ts          # Mock production data seeder
└── tests/               # API integration tests (Supertest + Vitest)
```

---

## 🔑 Authentication & Token Rotation Flow

```
Client                               Server (Auth Service)             Database
  │                                           │                           │
  ├────── POST /api/v1/auth/login ───────────►│                           │
  │                                           ├─ Verify Bcrypt Password   │
  │                                           ├─ Generate Access Token    │
  │                                           ├─ Hash Refresh Token ─────►│ Store RefreshToken Record
  │◄───── Return AccessToken + Cookie ────────┤                           │
  │                                           │                           │
  │ ──(After 15 min expiration)────────────── │                           │
  ├────── POST /api/v1/auth/refresh ──────────►│                           │
  │       (with RefreshToken Cookie)          ├─ Validate & Revoke Old ──►│ Revoke Old Token Record
  │                                           ├─ Generate New Refresh ───►│ Store New Token Record
  │◄───── Return New Access + Refresh Token ──┤                           │
```

---

## ⚡ Real-Time WebSocket Architecture

Socket.IO handles real-time updates through scoped rooms:
- **`user:<userId>`**: Direct notifications (e.g. issue assignment alerts).
- **`project:<projectId>`**: Kanban board movements, newly created issues, deleted issues.
- **`issue:<issueId>`**: Live comment streams and detailed status field edits.

---

## 🚀 Local Quickstart Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL & Redis (or Docker Compose)

### 1. Backend Setup

```bash
cd server
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma Client & Run Seeder
npm run prisma:generate
npm run prisma:seed

# Start Development Server
npm run dev
```
Backend API will run on `http://localhost:5000`  
Swagger UI documentation available at `http://localhost:5000/api-docs`

### 2. Frontend Setup

```bash
cd client
npm install

# Start Vite Dev Server
npm run dev
```
Frontend Web Application will run on `http://localhost:3000`

---

## 🐳 Docker Setup

Run the entire application stack (PostgreSQL, Redis, Express API, React Nginx) using Docker Compose:

```bash
docker-compose up --build
```

---

## 🎯 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Organization Owner** | `owner@devflow.io` | `Password123!` | Full Org & Project Management, Role Assignments |
| **Project Lead** | `admin@devflow.io` | `Password123!` | Manage Projects, Add Members, Manage Issues |
| **Developer / Member** | `developer@devflow.io` | `Password123!` | View Projects, Create/Update Assigned Issues, Comment |

---

## 💼 Resume-Ready Project Bullet Points

> Use these bullet points on your resume for SDE / Full-Stack / Backend Developer roles:

- **Architected DevFlow**: Built a full-stack developer collaboration and issue tracking platform using **React**, **TypeScript**, **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**, implementing a clean 4-tier layered architecture (`Routes` ➔ `Controllers` ➔ `Services` ➔ `Repositories`).
- **Real-Time WebSocket Engine**: Designed a room-based **Socket.IO** and **Redis** real-time event broadcaster for dynamic drag-and-drop Kanban updates, live comment streams, and instant user assignment notifications.
- **Enterprise Security & RBAC**: Implemented multi-tenant Role-Based Access Control (`Owner`, `Admin`, `Developer`) and JWT authentication with 15-minute access tokens and HTTP-only SHA-256 refresh token rotation and revocation.
- **Automated GitHub Integration**: Built a GitHub webhook parser service that listens to push events and automatically resolves DevFlow issue keys (`Fixes DEV-102`) into completed status states.
- **DevOps & Testing**: Configured **Docker Compose** containerization, **OpenAPI 3.0/Swagger** documentation, and **GitHub Actions** CI pipelines for automated linting, building, and **Supertest/Vitest** API testing.

---

## 🎤 Key Technical Interview Questions & Answers

### Q1: Why did you implement a 4-tier backend architecture instead of putting logic in Express routes?
**Answer**: Separating into Routes, Controllers, Services, and Repositories enforces the Single Responsibility Principle (SRP) and separation of concerns.
- **Routes** handle endpoint definitions, CORS, rate limits, and Zod input validation middleware.
- **Controllers** handle HTTP request parameter extraction and status code responses.
- **Services** encapsulate pure business logic, WebSocket broadcasts, and audit logging—making business logic easily unit-testable without mocking Express HTTP objects.
- **Repositories** abstract raw data access via Prisma ORM, allowing database layer optimization or vendor changes without breaking core domain services.

### Q2: How does your refresh token rotation security strategy work?
**Answer**: Access tokens are short-lived (15 mins) to minimize window of misuse if intercepted. Refresh tokens are long-lived (7 days) and stored as SHA-256 hashes in PostgreSQL. When a client requests a token refresh, the server revokes the old refresh token record in the database, attaches a `replacesTokenId` reference, and issues a brand-new access/refresh token pair. If a revoked refresh token is reused, the system detects potential token theft and revokes all active sessions for that user.

### Q3: How do you handle concurrency and order persistence on the Kanban board?
**Answer**: Each issue has a floating point `position` field. When a card is dragged between two items with positions `P1` and `P2`, the new position is calculated as `(P1 + P2) / 2`. This avoids re-indexing all rows in the database on every drag event. Furthermore, frontend state updates optimistically first for zero perceived latency, while emitting a Socket.IO event to all other clients subscribed to the `project:<id>` room to update their UI in real-time.
