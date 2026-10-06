export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProjectRole = 'LEAD' | 'DEVELOPER' | 'VIEWER';
export type IssueStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueType = 'BUG' | 'FEATURE' | 'TASK' | 'IMPROVEMENT';
export type NotificationType = 'ASSIGNMENT' | 'MENTION' | 'COMMENT' | 'STATUS_CHANGE' | 'PROJECT_INVITE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  githubUsername?: string | null;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  user: User;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  ownerId: string;
  members: OrganizationMember[];
  projects?: Project[];
  currentUserRole?: OrgRole;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  organizationId: string;
  ownerId: string;
  members: ProjectMember[];
  _count?: {
    issues: number;
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
  organizationId: string;
}

export interface IssueLabel {
  issueId: string;
  labelId: string;
  label: Label;
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  projectId?: string | null;
  issueId?: string | null;
  actorId: string;
  actor: { id: string; name: string; avatarUrl?: string | null };
  issue?: { id: string; issueKey: string; title: string } | null;
  action: string;
  details: any;
  createdAt: string;
}

export interface Issue {
  id: string;
  issueKey: string;
  issueNumber: number;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  position: number;
  dueDate?: string | null;
  projectId: string;
  project?: { id: string; name: string; key: string };
  reporterId: string;
  reporter: User;
  assigneeId?: string | null;
  assignee?: User | null;
  labels: IssueLabel[];
  comments?: Comment[];
  activityLogs?: ActivityLog[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string | null;
  actor?: { id: string; name: string; avatarUrl?: string | null } | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface GitHubIntegration {
  id: string;
  projectId: string;
  repositoryName: string;
  repositoryUrl: string;
  isConnected: boolean;
  connectedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    unreadCount?: number;
  };
}
