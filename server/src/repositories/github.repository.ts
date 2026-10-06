import { prisma } from '../config/prisma';

export class GitHubRepository {
  async upsertIntegration(projectId: string, data: {
    repositoryName: string;
    repositoryUrl: string;
    githubRepoId?: string;
    webhookSecret?: string;
    accessToken?: string;
  }) {
    return prisma.gitHubIntegration.upsert({
      where: { projectId },
      create: {
        projectId,
        repositoryName: data.repositoryName,
        repositoryUrl: data.repositoryUrl,
        githubRepoId: data.githubRepoId,
        webhookSecret: data.webhookSecret,
        accessToken: data.accessToken,
        isConnected: true,
      },
      update: {
        repositoryName: data.repositoryName,
        repositoryUrl: data.repositoryUrl,
        githubRepoId: data.githubRepoId,
        webhookSecret: data.webhookSecret,
        accessToken: data.accessToken,
        isConnected: true,
      },
    });
  }

  async findByProjectId(projectId: string) {
    return prisma.gitHubIntegration.findUnique({
      where: { projectId },
    });
  }

  async findByRepositoryName(repositoryName: string) {
    return prisma.gitHubIntegration.findFirst({
      where: { repositoryName: { equals: repositoryName } },
      include: { project: true },
    });
  }

  async disconnect(projectId: string) {
    return prisma.gitHubIntegration.update({
      where: { projectId },
      data: { isConnected: false },
    });
  }
}

export const gitHubRepository = new GitHubRepository();
