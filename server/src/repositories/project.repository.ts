import { prisma } from '../config/prisma';
import { ProjectRole, ProjectStatus } from '../types';

export class ProjectRepository {
  async create(data: {
    name: string;
    key: string;
    description?: string;
    organizationId: string;
    ownerId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: data.name,
          key: data.key.toUpperCase(),
          description: data.description,
          organizationId: data.organizationId,
          ownerId: data.ownerId,
        },
      });

      // Add owner as Project LEAD
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: data.ownerId,
          role: ProjectRole.LEAD,
        },
      });

      return project;
    });
  }

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true, githubUsername: true } },
          },
        },
        githubIntegration: true,
        _count: {
          select: { issues: true },
        },
      },
    });
  }

  async findByOrganization(organizationId: string, userId: string) {
    return prisma.project.findMany({
      where: {
        organizationId,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: { name?: string; description?: string; status?: ProjectStatus }) {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, userId: string, role: ProjectRole = ProjectRole.DEVELOPER) {
    return prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async removeMember(projectId: string, userId: string) {
    return prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async findMember(projectId: string, userId: string) {
    return prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }
}

export const projectRepository = new ProjectRepository();
