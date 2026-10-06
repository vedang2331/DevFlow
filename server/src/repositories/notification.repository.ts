import { prisma } from '../config/prisma';
import { NotificationType } from '../types';

export class NotificationRepository {
  async create(data: {
    userId: string;
    actorId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data,
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async findByUser(userId: string, limit = 30) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationRepository = new NotificationRepository();
