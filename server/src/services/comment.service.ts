import { commentRepository } from '../repositories/comment.repository';
import { issueRepository } from '../repositories/issue.repository';
import { activityRepository } from '../repositories/activity.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { socketManager } from '../sockets/socket.manager';
import { NotFoundError, ForbiddenError } from '../utils/app-error';
import { NotificationType } from '../types';

export class CommentService {
  async addComment(issueId: string, authorId: string, content: string) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue not found');
    }

    const comment = await commentRepository.create(issueId, authorId, content);

    // Audit Log
    await activityRepository.log({
      organizationId: issue.project.organizationId,
      projectId: issue.projectId,
      issueId,
      actorId: authorId,
      action: 'COMMENT_ADDED',
      details: { issueKey: issue.issueKey, preview: content.slice(0, 50) },
    });

    // Realtime Socket Emission
    socketManager.emitToIssue(issueId, 'comment_added', comment);
    socketManager.emitToProject(issue.projectId, 'comment_added', { issueId, comment });

    // Notify issue assignee and reporter (if not the commenter)
    const usersToNotify = new Set<string>();
    if (issue.assigneeId && issue.assigneeId !== authorId) usersToNotify.add(issue.assigneeId);
    if (issue.reporterId && issue.reporterId !== authorId) usersToNotify.add(issue.reporterId);

    for (const userId of Array.from(usersToNotify)) {
      const notif = await notificationRepository.create({
        userId,
        actorId: authorId,
        type: NotificationType.COMMENT,
        title: `New comment on ${issue.issueKey}`,
        message: `${(comment as any).author.name} commented: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
        link: `/projects/${issue.projectId}/board?issue=${issue.id}`,
      });
      socketManager.emitToUser(userId, 'notification', notif);
    }

    return comment;
  }

  async getCommentsByIssue(issueId: string) {
    return commentRepository.findByIssue(issueId);
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updated = await commentRepository.update(commentId, content);
    socketManager.emitToIssue(comment.issueId, 'comment_updated', updated);

    return updated;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await commentRepository.delete(commentId);
    socketManager.emitToIssue(comment.issueId, 'comment_deleted', { commentId });
  }
}

export const commentService = new CommentService();
