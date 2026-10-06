# DevFlow Database Schema Documentation

## Entity Relationship Overview

The DevFlow PostgreSQL database is managed via Prisma ORM with strict referential integrity, cascading deletes where appropriate, and multi-column indexes for search optimization.

---

## Core Entities & Relationships

### 1. User
- Stores user credentials, profile information, and GitHub username.
- Relations:
  - Has many `RefreshToken` records.
  - Owns / belongs to multiple `OrganizationMember` entries.
  - Belongs to multiple `ProjectMember` entries.
  - Assigned to / reported multiple `Issue` records.
  - Created comments, activity logs, and notifications.

### 2. RefreshToken
- Tracks refresh tokens for secure token rotation.
- Fields: `id`, `tokenHash`, `userId`, `expiresAt`, `revokedAt`, `replacesTokenId`, `createdAt`, `userAgent`, `ipAddress`.

### 3. Organization & OrganizationMember
- `Organization`: Represents workspaces containing projects and members.
- `OrganizationMember`: Composite relation with roles `OWNER`, `ADMIN`, `MEMBER`.

### 4. Project & ProjectMember
- `Project`: Project details, unique project key (`key`, e.g. "DEV"), description, status (`ACTIVE`, `ARCHIVED`).
- `ProjectMember`: Composite relation with roles `LEAD`, `DEVELOPER`, `VIEWER`.

### 5. Issue & IssueLabel
- `Issue`: Main task entity. Key is formatted as `<ProjectKey>-<IssueNumber>` (e.g. `DEV-101`).
- Fields: `title`, `description`, `status` (`BACKLOG`, `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `type` (`BUG`, `FEATURE`, `TASK`, `IMPROVEMENT`), `position` (float ordering for Kanban), `dueDate`.
- Foreign Keys: `projectId`, `reporterId`, `assigneeId`.

### 6. Label & IssueLabel
- `Label`: Categorization tag belonging to an Organization (`name`, `color`).
- `IssueLabel`: Many-to-many join table between `Issue` and `Label`.

### 7. Comment
- `Comment`: User comments on specific issues. Stores `content`, `issueId`, `authorId`, timestamps.

### 8. ActivityLog
- `ActivityLog`: Comprehensive audit trail for system events.
- Fields: `organizationId`, `projectId`, `issueId`, `actorId`, `action`, `details` (JSON payload).

### 9. Notification
- `Notification`: System and real-time alerts.
- Fields: `userId`, `actorId`, `type`, `title`, `message`, `link`, `isRead`.

### 10. GitHubIntegration
- `GitHubIntegration`: Stores GitHub repo binding for a project.
- Fields: `projectId`, `repositoryName`, `repositoryUrl`, `githubRepoId`, `webhookSecret`, `isConnected`.
