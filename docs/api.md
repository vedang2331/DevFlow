# DevFlow REST API Documentation

Base URL: `/api/v1`

---

## Auth Endpoints (`/api/v1/auth`)

| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account | Public |
| POST | `/auth/login` | Authenticate user & issue tokens | Public |
| POST | `/auth/refresh` | Rotate access & refresh tokens | Public |
| POST | `/auth/logout` | Revoke refresh token & clear sessions | Protected |
| GET | `/auth/me` | Fetch authenticated user profile | Protected |

---

## Organization Endpoints (`/api/v1/organizations`)

| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/organizations` | Create new organization workspace | Protected |
| GET | `/organizations` | List organizations user belongs to | Protected |
| GET | `/organizations/:id` | Get organization details & members | Org Member |
| PATCH | `/organizations/:id` | Update organization details | Org Admin/Owner |
| POST | `/organizations/:id/members` | Add/Invite member to organization | Org Admin/Owner |
| PATCH | `/organizations/:id/members/:userId` | Update member role | Org Admin/Owner |
| DELETE | `/organizations/:id/members/:userId` | Remove member from organization | Org Admin/Owner |

---

## Project Endpoints (`/api/v1/projects`)

| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/projects` | Create new project | Org Admin/Owner |
| GET | `/projects` | List projects (with query filtering) | Protected |
| GET | `/projects/:id` | Get project details & statistics | Project Member |
| PATCH | `/projects/:id` | Update project metadata | Project Lead / Admin |
| DELETE | `/projects/:id` | Archive or delete project | Org Owner |
| POST | `/projects/:id/members` | Add project member | Project Lead / Admin |

---

## Issue & Kanban Endpoints (`/api/v1/issues`)

| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/projects/:projectId/issues` | List & filter issues for project | Project Member |
| POST | `/projects/:projectId/issues` | Create a new issue | Project Member |
| GET | `/issues/:id` | Get issue details with comments & logs | Project Member |
| PATCH | `/issues/:id` | Update issue (status, priority, assignee, etc.) | Project Member |
| PATCH | `/issues/:id/reorder` | Move issue column / update Kanban position | Project Member |
| DELETE | `/issues/:id` | Delete issue | Project Lead / Admin |

---

## Comments & Activity Endpoints

| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/issues/:issueId/comments` | List comments for an issue | Project Member |
| POST | `/issues/:issueId/comments` | Add comment to an issue | Project Member |
| DELETE | `/comments/:id` | Delete comment | Author / Admin |
| GET | `/projects/:projectId/activity` | List audit activity logs for project | Project Member |

---

## Notifications Endpoints (`/api/v1/notifications`)

| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/notifications` | Get user notifications & unread count | Protected |
| PATCH | `/notifications/:id/read` | Mark single notification as read | Protected |
| PATCH | `/notifications/read-all` | Mark all notifications as read | Protected |

---

## GitHub Integration Endpoints (`/api/v1/github`)

| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/projects/:projectId/github/connect` | Connect GitHub repository | Project Lead / Admin |
| GET | `/projects/:projectId/github` | Get connected GitHub info & commits | Project Member |
| POST | `/webhooks/github` | GitHub webhook handler endpoint | Public (Verified signature) |
