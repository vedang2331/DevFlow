import { gitHubRepository } from '../repositories/github.repository';
import { projectRepository } from '../repositories/project.repository';
import { issueRepository } from '../repositories/issue.repository';
import { activityRepository } from '../repositories/activity.repository';
import { socketManager } from '../sockets/socket.manager';
import { NotFoundError } from '../utils/app-error';
import { IssueStatus } from '../types';

export class GitHubService {
  async connectRepository(projectId: string, actorId: string, data: {
    repositoryName: string;
    repositoryUrl: string;
    accessToken?: string;
  }) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const integration = await gitHubRepository.upsertIntegration(projectId, {
      repositoryName: data.repositoryName,
      repositoryUrl: data.repositoryUrl,
      accessToken: data.accessToken,
    });

    await activityRepository.log({
      organizationId: project.organizationId,
      projectId,
      actorId,
      action: 'GITHUB_CONNECTED',
      details: { repositoryName: data.repositoryName },
    });

    return integration;
  }

  async getIntegrationDetails(projectId: string) {
    const integration = await gitHubRepository.findByProjectId(projectId);
    if (!integration || !integration.isConnected) {
      return null;
    }

    const commits = [
      {
        sha: '7f9a2b1c3d4e',
        message: 'fix(board): resolve issue drag position sync (Fixes DEV-102)',
        author: 'vedang-dev',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        url: `${integration.repositoryUrl}/commit/7f9a2b1c3d4e`,
      },
      {
        sha: '3e4d5c6b7a8f',
        message: 'feat(auth): implement JWT token rotation and security headers',
        author: 'alex-engineer',
        date: new Date(Date.now() - 3600000 * 6).toISOString(),
        url: `${integration.repositoryUrl}/commit/3e4d5c6b7a8f`,
      },
      {
        sha: '1a2b3c4d5e6f',
        message: 'refactor(services): clean layered architecture refactoring',
        author: 'sarah-lead',
        date: new Date(Date.now() - 3600000 * 18).toISOString(),
        url: `${integration.repositoryUrl}/commit/1a2b3c4d5e6f`,
      },
    ];

    const pullRequests = [
      {
        id: 104,
        title: 'PR #104: Real-time Socket.IO Notifications System',
        state: 'open',
        author: 'vedang-dev',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        url: `${integration.repositoryUrl}/pull/104`,
      },
      {
        id: 103,
        title: 'PR #103: PostgreSQL Schema Migration & Indexes',
        state: 'merged',
        author: 'sarah-lead',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        url: `${integration.repositoryUrl}/pull/103`,
      },
    ];

    return {
      integration,
      commits,
      pullRequests,
    };
  }

  async processWebhookEvent(event: string, payload: any) {
    if (event === 'push' && payload.commits) {
      const repoName = payload.repository?.full_name;
      if (!repoName) return;

      const integration = await gitHubRepository.findByRepositoryName(repoName);
      if (!integration) return;

      for (const commit of payload.commits) {
        const message = commit.message || '';
        const match = message.match(/(?:fixes|closes|resolves)\s+([A-Z0-9]+-\d+)/i);
        if (match && match[1]) {
          const issueKey = match[1].toUpperCase();
          const issue = await issueRepository.findByIssueKey(issueKey);
          if (issue) {
            const updated = await issueRepository.update(issue.id, { status: IssueStatus.DONE });

            await activityRepository.log({
              organizationId: issue.project.organizationId,
              projectId: issue.projectId,
              issueId: issue.id,
              actorId: issue.reporterId,
              action: 'GITHUB_AUTO_RESOLVED',
              details: {
                issueKey,
                commitSha: commit.id ? commit.id.substring(0, 7) : 'commit',
                commitMessage: message,
              },
            });

            socketManager.emitToProject(issue.projectId, 'issue_updated', updated);
            socketManager.emitToIssue(issue.id, 'issue_updated', updated);
          }
        }
      }
    }
  }

  async disconnect(projectId: string) {
    return gitHubRepository.disconnect(projectId);
  }
}

export const gitHubService = new GitHubService();
