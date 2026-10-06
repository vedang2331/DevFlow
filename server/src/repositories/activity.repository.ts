import { prisma } from '../config/prisma';

export class ActivityRepository {
  async log(data: {
    organizationId: string;
    projectId?: string;
    issueId?: string;
    actorId: string;
    action: string;
    details: object | string;
  }) {
    return prisma.activityLog.create({
      data: {
        organizationId: data.organizationId,
        projectId: data.projectId,
        issueId: data.issueId,
        actorId: data.actorId,
        action: data.action,
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
      },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        issue: { select: { id: true, issueKey: true, title: true } },
      },
    });
  }

  async findByProject(projectId: string, limit = 25) {
    const logs = await prisma.activityLog.findMany({
      where: { projectId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        issue: { select: { id: true, issueKey: true, title: true } },
      },
    });

    return logs.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }));
  }

  async findByOrganization(organizationId: string, limit = 50) {
    const logs = await prisma.activityLog.findMany({
      where: { organizationId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
        issue: { select: { id: true, issueKey: true, title: true } },
        project: { select: { id: true, name: true, key: true } },
      },
    });

    return logs.map(log => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
    }));
  }
}

export const activityRepository = new ActivityRepository();
