import { notificationRepository } from '../repositories/notification.repository';

export class NotificationService {
  async getUserNotifications(userId: string) {
    return notificationRepository.findByUser(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    await notificationRepository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
