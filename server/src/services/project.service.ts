import { projectRepository } from '../repositories/project.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { activityRepository } from '../repositories/activity.repository';
import { NotFoundError, ForbiddenError } from '../utils/app-error';
import { ProjectRole, ProjectStatus } from '../types';

export class ProjectService {
  async createProject(userId: string, data: { name: string; key: string; description?: string; organizationId: string }) {
    const orgMember = await organizationRepository.findMember(data.organizationId, userId);
    if (!orgMember) {
      throw new ForbiddenError('You are not a member of this organization');
    }

    const projectKey = data.key.toUpperCase();

    const project = await projectRepository.create({
      name: data.name,
      key: projectKey,
      description: data.description,
      organizationId: data.organizationId,
      ownerId: userId,
    });

    await activityRepository.log({
      organizationId: data.organizationId,
      projectId: project.id,
      actorId: userId,
      action: 'PROJECT_CREATED',
      details: { name: project.name, key: project.key },
    });

    return project;
  }

  async getProjectsByOrg(organizationId: string, userId: string) {
    return projectRepository.findByOrganization(organizationId, userId);
  }

  async getProjectById(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    return project;
  }

  async updateProject(projectId: string, userId: string, data: { name?: string; description?: string; status?: ProjectStatus }) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const updated = await projectRepository.update(projectId, data);

    await activityRepository.log({
      organizationId: project.organizationId,
      projectId,
      actorId: userId,
      action: 'PROJECT_UPDATED',
      details: data,
    });

    return updated;
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    await activityRepository.log({
      organizationId: project.organizationId,
      actorId: userId,
      action: 'PROJECT_DELETED',
      details: { name: project.name, key: project.key },
    });

    await projectRepository.delete(projectId);
  }

  async addProjectMember(projectId: string, requesterId: string, targetUserId: string, role: ProjectRole = ProjectRole.DEVELOPER) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const member = await projectRepository.addMember(projectId, targetUserId, role);

    await activityRepository.log({
      organizationId: project.organizationId,
      projectId,
      actorId: requesterId,
      action: 'PROJECT_MEMBER_ADDED',
      details: { targetUserId, role },
    });

    return member;
  }

  async removeProjectMember(projectId: string, requesterId: string, targetUserId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError('Project not found');

    await projectRepository.removeMember(projectId, targetUserId);

    await activityRepository.log({
      organizationId: project.organizationId,
      projectId,
      actorId: requesterId,
      action: 'PROJECT_MEMBER_REMOVED',
      details: { targetUserId },
    });
  }
}

export const projectService = new ProjectService();
