import { Request } from 'express';

export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ProjectRole {
  LEAD = 'LEAD',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum IssueStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum IssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IssueType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  TASK = 'TASK',
  IMPROVEMENT = 'IMPROVEMENT',
}

export enum NotificationType {
  ASSIGNMENT = 'ASSIGNMENT',
  MENTION = 'MENTION',
  COMMENT = 'COMMENT',
  STATUS_CHANGE = 'STATUS_CHANGE',
  PROJECT_INVITE = 'PROJECT_INVITE',
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  githubUsername?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  orgRole?: OrgRole;
  projectRole?: ProjectRole;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
