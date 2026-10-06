import { organizationRepository } from '../repositories/organization.repository';
import { userRepository } from '../repositories/user.repository';
import { activityRepository } from '../repositories/activity.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { socketManager } from '../sockets/socket.manager';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/app-error';
import { OrgRole, NotificationType } from '../types';

export class OrganizationService {
  async createOrganization(userId: string, data: { name: string; slug: string; logoUrl?: string }) {
    const existing = await organizationRepository.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError('Organization slug is already taken');
    }

    const org = await organizationRepository.create({
      name: data.name,
      slug: data.slug,
      logoUrl: data.logoUrl,
      ownerId: userId,
    });

    await activityRepository.log({
      organizationId: org.id,
      actorId: userId,
      action: 'ORGANIZATION_CREATED',
      details: { name: org.name, slug: org.slug },
    });

    return org;
  }

  async getUserOrganizations(userId: string) {
    return organizationRepository.findUserOrganizations(userId);
  }

  async getOrganizationDetails(orgId: string, userId: string) {
    const member = await organizationRepository.findMember(orgId, userId);
    if (!member) {
      throw new ForbiddenError('You are not a member of this organization');
    }

    const org = await organizationRepository.findById(orgId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return { ...org, currentUserRole: member.role };
  }

  async inviteMember(orgId: string, inviterId: string, email: string, role: OrgRole = OrgRole.MEMBER) {
    const targetUser = await userRepository.findByEmail(email);
    if (!targetUser) {
      throw new NotFoundError('User with this email address does not exist on DevFlow');
    }

    const existingMember = await organizationRepository.findMember(orgId, targetUser.id);
    if (existingMember) {
      throw new ConflictError('User is already a member of this organization');
    }

    const newMember = await organizationRepository.addMember(orgId, targetUser.id, role);
    const org = await organizationRepository.findById(orgId);

    // Activity log & notification
    await activityRepository.log({
      organizationId: orgId,
      actorId: inviterId,
      action: 'MEMBER_ADDED',
      details: { invitedUser: targetUser.name, email: targetUser.email, role },
    });

    const notif = await notificationRepository.create({
      userId: targetUser.id,
      actorId: inviterId,
      type: NotificationType.PROJECT_INVITE,
      title: 'Organization Invitation',
      message: `You were added to organization "${org?.name}" as ${role}`,
      link: `/workspace/${org?.slug}`,
    });

    socketManager.emitToUser(targetUser.id, 'notification', notif);

    return newMember;
  }

  async updateMemberRole(orgId: string, requesterId: string, targetUserId: string, role: OrgRole) {
    const updated = await organizationRepository.updateMemberRole(orgId, targetUserId, role);
    await activityRepository.log({
      organizationId: orgId,
      actorId: requesterId,
      action: 'MEMBER_ROLE_UPDATED',
      details: { targetUserId, newRole: role },
    });
    return updated;
  }

  async removeMember(orgId: string, requesterId: string, targetUserId: string) {
    const org = await organizationRepository.findById(orgId);
    if (org?.ownerId === targetUserId) {
      throw new ForbiddenError('Cannot remove organization owner');
    }

    await organizationRepository.removeMember(orgId, targetUserId);

    await activityRepository.log({
      organizationId: orgId,
      actorId: requesterId,
      action: 'MEMBER_REMOVED',
      details: { targetUserId },
    });
  }
}

export const organizationService = new OrganizationService();
