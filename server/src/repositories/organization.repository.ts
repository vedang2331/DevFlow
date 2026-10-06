import { prisma } from '../config/prisma';
import { OrgRole } from '../types';

export class OrganizationRepository {
  async create(data: { name: string; slug: string; logoUrl?: string; ownerId: string }) {
    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug.toLowerCase(),
          logoUrl: data.logoUrl,
          ownerId: data.ownerId,
        },
      });

      // Add owner as Organization OWNER member
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: data.ownerId,
          role: OrgRole.OWNER,
        },
      });

      return org;
    });
  }

  async findBySlug(slug: string) {
    return prisma.organization.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, githubUsername: true },
            },
          },
        },
        projects: true,
        labels: true,
      },
    });
  }

  async findUserOrganizations(userId: string) {
    return prisma.organization.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: { name?: string; slug?: string; logoUrl?: string }) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  async addMember(organizationId: string, userId: string, role: OrgRole = OrgRole.MEMBER) {
    return prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async updateMemberRole(organizationId: string, userId: string, role: OrgRole) {
    return prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async removeMember(organizationId: string, userId: string) {
    return prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }

  async findMember(organizationId: string, userId: string) {
    return prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });
  }
}

export const organizationRepository = new OrganizationRepository();
