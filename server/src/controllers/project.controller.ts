import { Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { activityRepository } from '../repositories/activity.repository';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class ProjectController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(req.user!.id, req.body);
      return sendSuccess(res, project, 'Project created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async listByOrg(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orgId = (req.query.organizationId as string) || (req.params.organizationId as string);
      const projects = await projectService.getProjectsByOrg(orgId, req.user!.id);
      return sendSuccess(res, projects);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProjectById(req.params.id, req.user!.id);
      return sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(req.params.id, req.user!.id, req.body);
      return sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.deleteProject(req.params.id, req.user!.id);
      return sendSuccess(res, null, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await projectService.addProjectMember(req.params.id, req.user!.id, req.body.userId, req.body.role);
      return sendSuccess(res, member, 'Project member added', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.removeProjectMember(req.params.id, req.user!.id, req.params.userId);
      return sendSuccess(res, null, 'Project member removed');
    } catch (error) {
      next(error);
    }
  }

  async getProjectActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await activityRepository.findByProject(req.params.id);
      return sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
