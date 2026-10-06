import { Request, Response, NextFunction } from 'express';
import { gitHubService } from '../services/github.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class GitHubController {
  async connect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const integration = await gitHubService.connectRepository(req.params.projectId, req.user!.id, req.body);
      return sendSuccess(res, integration, 'GitHub repository connected successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await gitHubService.getIntegrationDetails(req.params.projectId);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const event = req.headers['x-github-event'] as string;
      await gitHubService.processWebhookEvent(event, req.body);
      return sendSuccess(res, { received: true }, 'Webhook processed');
    } catch (error) {
      next(error);
    }
  }

  async disconnect(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gitHubService.disconnect(req.params.projectId);
      return sendSuccess(res, null, 'GitHub integration disconnected');
    } catch (error) {
      next(error);
    }
  }
}

export const gitHubController = new GitHubController();
