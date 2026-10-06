import { prisma } from '../config/prisma';
import { IssueStatus, IssuePriority, IssueType } from '../types';
import { Prisma } from '@prisma/client';

export interface IssueFilterParams {
  projectId: string;
  search?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assigneeId?: string;
  reporterId?: string;
  labelId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'position';
  sortOrder?: 'asc' | 'desc';
}

export class IssueRepository {
  async create(data: {
    projectId: string;
    reporterId: string;
    title: string;
    description?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    type?: IssueType;
    assigneeId?: string | null;
    dueDate?: Date | null;
    labelIds?: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: data.projectId },
        select: { key: true },
      });

      if (!project) throw new Error('Project not found');

      // Get highest issue number for this project to generate next key (e.g. DEV-101)
      const lastIssue = await tx.issue.findFirst({
        where: { projectId: data.projectId },
        orderBy: { issueNumber: 'desc' },
        select: { issueNumber: true },
      });

      const nextNumber = lastIssue ? lastIssue.issueNumber + 1 : 101;
      const issueKey = `${project.key}-${nextNumber}`;

      // Get count of existing items in the target column to calculate position
      const countInStatus = await tx.issue.count({
        where: { projectId: data.projectId, status: data.status || IssueStatus.BACKLOG },
      });

      const issue = await tx.issue.create({
        data: {
          issueKey,
          issueNumber: nextNumber,
          title: data.title,
          description: data.description,
          status: data.status || IssueStatus.BACKLOG,
          priority: data.priority || IssuePriority.MEDIUM,
          type: data.type || IssueType.TASK,
          position: (countInStatus + 1) * 1000,
          dueDate: data.dueDate,
          projectId: data.projectId,
          reporterId: data.reporterId,
          assigneeId: data.assigneeId,
          labels: data.labelIds && data.labelIds.length > 0 ? {
            create: data.labelIds.map(labelId => ({ labelId })),
          } : undefined,
        },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          labels: { include: { label: true } },
          project: { select: { id: true, name: true, key: true } },
          _count: { select: { comments: true } },
        },
      });

      return issue;
    });
  }

  async findById(id: string) {
    return prisma.issue.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: { include: { label: true } },
        project: { select: { id: true, name: true, key: true, organizationId: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        activityLogs: {
          include: {
            actor: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async findByIssueKey(issueKey: string) {
    return prisma.issue.findUnique({
      where: { issueKey: issueKey.toUpperCase() },
      include: {
        reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        labels: { include: { label: true } },
        project: { select: { id: true, name: true, key: true, organizationId: true } },
      },
    });
  }

  async findMany(params: IssueFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.IssueWhereInput = {
      projectId: params.projectId,
      ...(params.status ? { status: params.status } : {}),
      ...(params.priority ? { priority: params.priority } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(params.assigneeId ? { assigneeId: params.assigneeId } : {}),
      ...(params.reporterId ? { reporterId: params.reporterId } : {}),
      ...(params.labelId ? { labels: { some: { labelId: params.labelId } } } : {}),
      ...(params.search ? {
        OR: [
          { title: { contains: params.search } },
          { description: { contains: params.search } },
          { issueKey: { contains: params.search } },
        ],
      } : {}),
    };

    const sortBy = params.sortBy || 'position';
    const sortOrder = params.sortOrder || 'asc';

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          labels: { include: { label: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      issues,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: {
    title?: string;
    description?: string | null;
    status?: IssueStatus;
    priority?: IssuePriority;
    type?: IssueType;
    assigneeId?: string | null;
    dueDate?: Date | null;
    position?: number;
    labelIds?: string[];
  }) {
    return prisma.$transaction(async (tx) => {
      if (data.labelIds !== undefined) {
        await tx.issueLabel.deleteMany({ where: { issueId: id } });
        if (data.labelIds.length > 0) {
          await tx.issueLabel.createMany({
            data: data.labelIds.map(labelId => ({ issueId: id, labelId })),
          });
        }
      }

      const updated = await tx.issue.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.priority !== undefined ? { priority: data.priority } : {}),
          ...(data.type !== undefined ? { type: data.type } : {}),
          ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
          ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
          ...(data.position !== undefined ? { position: data.position } : {}),
        },
        include: {
          reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          labels: { include: { label: true } },
          project: { select: { id: true, name: true, key: true, organizationId: true } },
          _count: { select: { comments: true } },
        },
      });

      return updated;
    });
  }

  async delete(id: string) {
    return prisma.issue.delete({
      where: { id },
    });
  }
}

export const issueRepository = new IssueRepository();
