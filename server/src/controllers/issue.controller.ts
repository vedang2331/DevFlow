import { Response, NextFunction } from 'express';
import { issueService } from '../services/issue.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest, IssueStatus, IssuePriority, IssueType } from '../types';

export class IssueController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      const issue = await issueService.createIssue(req.user!.id, {
        ...req.body,
        projectId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      });
      return sendSuccess(res, issue, 'Issue created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId || (req.query.projectId as string);
      const { issues, meta } = await issueService.listIssues({
        projectId,
        search: req.query.search as string,
        status: req.query.status as IssueStatus,
        priority: req.query.priority as IssuePriority,
        type: req.query.type as IssueType,
        assigneeId: req.query.assigneeId as string,
        reporterId: req.query.reporterId as string,
        labelId: req.query.labelId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      });

      return sendSuccess(res, issues, undefined, 200, meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getIssueDetails(req.params.id);
      return sendSuccess(res, issue);
    } catch (error) {
      next(error);
    }
  }

  async getByKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issue = await issueService.getIssueByKey(req.params.key);
      return sendSuccess(res, issue);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await issueService.updateIssue(req.params.id, req.user!.id, {
        ...req.body,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : req.body.dueDate,
      });
      return sendSuccess(res, updated, 'Issue updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await issueService.reorderKanbanPosition(
        req.params.id,
        req.user!.id,
        req.body.status,
        req.body.position
      );
      return sendSuccess(res, updated, 'Kanban issue position updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await issueService.deleteIssue(req.params.id, req.user!.id);
      return sendSuccess(res, null, 'Issue deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const issueController = new IssueController();
