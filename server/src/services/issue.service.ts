import { issueRepository, IssueFilterParams } from '../repositories/issue.repository';
import { projectRepository } from '../repositories/project.repository';
import { activityRepository } from '../repositories/activity.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { socketManager } from '../sockets/socket.manager';
import { NotFoundError } from '../utils/app-error';
import { IssueStatus, IssuePriority, IssueType, NotificationType } from '../types';

export class IssueService {
  async createIssue(reporterId: string, data: {
    projectId: string;
    title: string;
    description?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    type?: IssueType;
    assigneeId?: string | null;
    dueDate?: Date | null;
    labelIds?: string[];
  }) {
    const project = await projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const issue = await issueRepository.create({
      ...data,
      reporterId,
    });

    // Audit log
    await activityRepository.log({
      organizationId: project.organizationId,
      projectId: project.id,
      issueId: issue.id,
      actorId: reporterId,
      action: 'ISSUE_CREATED',
      details: { issueKey: issue.issueKey, title: issue.title, status: issue.status, priority: issue.priority },
    });

    // Broadcast Socket Event to Project Room
    socketManager.emitToProject(project.id, 'issue_created', issue);

    // Notification if assigned to someone else
    if (data.assigneeId && data.assigneeId !== reporterId) {
      const notif = await notificationRepository.create({
        userId: data.assigneeId,
        actorId: reporterId,
        type: NotificationType.ASSIGNMENT,
        title: `Assigned to ${issue.issueKey}`,
        message: `You were assigned to issue "${issue.title}" (${issue.issueKey})`,
        link: `/projects/${project.id}/board?issue=${issue.id}`,
      });
      socketManager.emitToUser(data.assigneeId, 'notification', notif);
    }

    return issue;
  }

  async getIssueDetails(issueId: string) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue not found');
    }
    return issue;
  }

  async getIssueByKey(issueKey: string) {
    const issue = await issueRepository.findByIssueKey(issueKey);
    if (!issue) {
      throw new NotFoundError('Issue not found');
    }
    return issue;
  }

  async listIssues(params: IssueFilterParams) {
    return issueRepository.findMany(params);
  }

  async updateIssue(issueId: string, actorId: string, data: {
    title?: string;
    description?: string | null;
    status?: IssueStatus;
    priority?: IssuePriority;
    type?: IssueType;
    assigneeId?: string | null;
    dueDate?: Date | null;
    position?: number;
    labelIds?: string[];
  }) {
    const existingIssue = await issueRepository.findById(issueId);
    if (!existingIssue) {
      throw new NotFoundError('Issue not found');
    }

    const updatedIssue = await issueRepository.update(issueId, data);

    // Activity logging
    const changes: string[] = [];
    if (data.status && data.status !== (existingIssue.status as any)) {
      changes.push(`status from ${existingIssue.status} to ${data.status}`);
    }
    if (data.priority && data.priority !== (existingIssue.priority as any)) {
      changes.push(`priority from ${existingIssue.priority} to ${data.priority}`);
    }
    if (data.assigneeId !== undefined && data.assigneeId !== existingIssue.assigneeId) {
      changes.push(`assignee`);
    }

    await activityRepository.log({
      organizationId: existingIssue.project.organizationId,
      projectId: existingIssue.projectId,
      issueId,
      actorId,
      action: 'ISSUE_UPDATED',
      details: {
        issueKey: existingIssue.issueKey,
        summary: changes.length > 0 ? `Updated ${changes.join(', ')}` : 'Updated issue details',
        oldStatus: existingIssue.status,
        newStatus: updatedIssue.status,
      },
    });

    // Notify new assignee if changed
    if (data.assigneeId && data.assigneeId !== existingIssue.assigneeId && data.assigneeId !== actorId) {
      const notif = await notificationRepository.create({
        userId: data.assigneeId,
        actorId,
        type: NotificationType.ASSIGNMENT,
        title: `Assigned to ${existingIssue.issueKey}`,
        message: `You were assigned to issue "${updatedIssue.title}"`,
        link: `/projects/${existingIssue.projectId}/board?issue=${existingIssue.id}`,
      });
      socketManager.emitToUser(data.assigneeId, 'notification', notif);
    }

    // Broadcast Real-time socket events
    socketManager.emitToProject(existingIssue.projectId, 'issue_updated', updatedIssue);
    socketManager.emitToIssue(issueId, 'issue_updated', updatedIssue);

    return updatedIssue;
  }

  async reorderKanbanPosition(issueId: string, actorId: string, status: IssueStatus, position: number) {
    const existingIssue = await issueRepository.findById(issueId);
    if (!existingIssue) {
      throw new NotFoundError('Issue not found');
    }

    const oldStatus = existingIssue.status;
    const updatedIssue = await issueRepository.update(issueId, { status, position });

    if (oldStatus !== status) {
      await activityRepository.log({
        organizationId: existingIssue.project.organizationId,
        projectId: existingIssue.projectId,
        issueId,
        actorId,
        action: 'STATUS_CHANGED',
        details: {
          issueKey: existingIssue.issueKey,
          oldStatus,
          newStatus: status,
        },
      });
    }

    socketManager.emitToProject(existingIssue.projectId, 'issue_reordered', {
      issueId,
      status,
      position,
      issue: updatedIssue,
    });

    return updatedIssue;
  }

  async deleteIssue(issueId: string, actorId: string) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new NotFoundError('Issue not found');
    }

    await activityRepository.log({
      organizationId: issue.project.organizationId,
      projectId: issue.projectId,
      actorId,
      action: 'ISSUE_DELETED',
      details: { issueKey: issue.issueKey, title: issue.title },
    });

    await issueRepository.delete(issueId);

    socketManager.emitToProject(issue.projectId, 'issue_deleted', { issueId });
  }
}

export const issueService = new IssueService();
