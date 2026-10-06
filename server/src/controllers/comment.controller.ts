import { Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class CommentController {
  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issueId = req.params.issueId || req.body.issueId;
      const comment = await commentService.addComment(issueId, req.user!.id, req.body.content);
      return sendSuccess(res, comment, 'Comment added', 201);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const issueId = req.params.issueId;
      const comments = await commentService.getCommentsByIssue(issueId);
      return sendSuccess(res, comments);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.updateComment(req.params.id, req.user!.id, req.body.content);
      return sendSuccess(res, comment, 'Comment updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentService.deleteComment(req.params.id, req.user!.id);
      return sendSuccess(res, null, 'Comment deleted');
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();
