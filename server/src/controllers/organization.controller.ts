import { Response, NextFunction } from 'express';
import { organizationService } from '../services/organization.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class OrganizationController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.createOrganization(req.user!.id, req.body);
      return sendSuccess(res, org, 'Organization created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orgs = await organizationService.getUserOrganizations(req.user!.id);
      return sendSuccess(res, orgs);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.getOrganizationDetails(req.params.id, req.user!.id);
      return sendSuccess(res, org);
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await organizationService.inviteMember(
        req.params.id,
        req.user!.id,
        req.body.email,
        req.body.role
      );
      return sendSuccess(res, member, 'Member invited successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await organizationService.updateMemberRole(
        req.params.id,
        req.user!.id,
        req.params.userId,
        req.body.role
      );
      return sendSuccess(res, updated, 'Member role updated');
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await organizationService.removeMember(req.params.id, req.user!.id, req.params.userId);
      return sendSuccess(res, null, 'Member removed from organization');
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
