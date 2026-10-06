import { z } from 'zod';
import { OrgRole, ProjectRole, IssueStatus, IssuePriority, IssueType } from '../types';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  githubUsername: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const createOrgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  logoUrl: z.string().url('Invalid URL').optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  logoUrl: z.string().url().optional(),
});

export const inviteOrgMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(OrgRole).default(OrgRole.MEMBER),
});

export const updateOrgMemberRoleSchema = z.object({
  role: z.nativeEnum(OrgRole),
});

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  key: z.string().min(2, 'Key must be 2-10 uppercase letters').max(10).transform(val => val.toUpperCase()),
  description: z.string().optional(),
  organizationId: z.string().uuid('Invalid Organization ID'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

export const addProjectMemberSchema = z.object({
  userId: z.string().uuid('Invalid User ID'),
  role: z.nativeEnum(ProjectRole).default(ProjectRole.DEVELOPER),
});

export const createIssueSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(IssueStatus).default(IssueStatus.BACKLOG),
  priority: z.nativeEnum(IssuePriority).default(IssuePriority.MEDIUM),
  type: z.nativeEnum(IssueType).default(IssueType.TASK),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  type: z.nativeEnum(IssueType).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  position: z.number().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const reorderIssueSchema = z.object({
  status: z.nativeEnum(IssueStatus),
  position: z.number(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code'),
  organizationId: z.string().uuid(),
});

export const githubConnectSchema = z.object({
  repositoryName: z.string().min(3, 'Repository name must be in format owner/repo'),
  repositoryUrl: z.string().url('Must be a valid URL'),
  accessToken: z.string().optional(),
});
