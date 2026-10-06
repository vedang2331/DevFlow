import { Response, NextFunction } from 'express';
import { AuthRequest, OrgRole, ProjectRole } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/app-error';
import { prisma } from '../config/prisma';

export const requireOrgRole = (allowedRoles: OrgRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const orgId = req.params.organizationId || req.params.id || req.body.organizationId;
      if (!orgId) {
        throw new ForbiddenError('Organization identifier missing from request');
      }

      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: req.user.id,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenError('You are not a member of this organization');
      }

      if (!allowedRoles.includes(membership.role as OrgRole)) {
        throw new ForbiddenError(`Action requires ${allowedRoles.join(' or ')} organization role`);
      }

      req.orgRole = membership.role as OrgRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireProjectRole = (allowedRoles: ProjectRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const projectId = req.params.projectId || req.params.id || req.body.projectId;
      if (!projectId) {
        throw new ForbiddenError('Project identifier missing from request');
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true, ownerId: true },
      });

      if (!project) {
        throw new NotFoundError('Project not found');
      }

      // Check if user is Org OWNER or ADMIN (implicit full project rights)
      const orgMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: project.organizationId,
            userId: req.user.id,
          },
        },
      });

      if (orgMember && (orgMember.role === OrgRole.OWNER || orgMember.role === OrgRole.ADMIN)) {
        req.projectRole = ProjectRole.LEAD;
        return next();
      }

      // Otherwise check direct project membership
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.user.id,
          },
        },
      });

      if (!projectMember) {
        throw new ForbiddenError('You are not assigned to this project');
      }

      if (!allowedRoles.includes(projectMember.role as ProjectRole)) {
        throw new ForbiddenError(`Action requires ${allowedRoles.join(' or ')} project role`);
      }

      req.projectRole = projectMember.role as ProjectRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};
