import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class NotificationController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUserNotifications(req.user!.id);
      return sendSuccess(res, result.notifications, undefined, 200, { unreadCount: result.unreadCount } as any);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.id);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
