import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const OrgRole = { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER' };
const ProjectRole = { LEAD: 'LEAD', DEVELOPER: 'DEVELOPER', VIEWER: 'VIEWER' };
const IssueStatus = { BACKLOG: 'BACKLOG', TODO: 'TODO', IN_PROGRESS: 'IN_PROGRESS', IN_REVIEW: 'IN_REVIEW', DONE: 'DONE' };
const IssuePriority = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' };
const IssueType = { BUG: 'BUG', FEATURE: 'FEATURE', TASK: 'TASK', IMPROVEMENT: 'IMPROVEMENT' };

async function main() {
  console.log('🌱 Seeding DevFlow production mock database...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issueLabel.deleteMany();
  await prisma.label.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.gitHubIntegration.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const userOwner = await prisma.user.create({
    data: {
      name: 'Vedang Dev',
      email: 'owner@devflow.io',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=VedangDev',
      githubUsername: 'vedang-dev',
    },
  });

  const userAdmin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'admin@devflow.io',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=SarahConnor',
      githubUsername: 'sarah-lead',
    },
  });

  const userDev = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'developer@devflow.io',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=AlexRivera',
      githubUsername: 'alex-engineer',
    },
  });

  console.log('✅ Created demo users (owner@devflow.io, admin@devflow.io, developer@devflow.io)');

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'DevFlow Core Engineering',
      slug: 'devflow-team',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=DevFlowOrg',
      ownerId: userOwner.id,
      members: {
        create: [
          { userId: userOwner.id, role: OrgRole.OWNER },
          { userId: userAdmin.id, role: OrgRole.ADMIN },
          { userId: userDev.id, role: OrgRole.MEMBER },
        ],
      },
    },
  });

  console.log('✅ Created organization: DevFlow Core Engineering');

  // 3. Create Labels
  const labelFrontend = await prisma.label.create({
    data: { name: 'Frontend', color: '#3b82f6', organizationId: org.id },
  });
  const labelBackend = await prisma.label.create({
    data: { name: 'Backend', color: '#10b981', organizationId: org.id },
  });
  const labelSecurity = await prisma.label.create({
    data: { name: 'Security', color: '#ef4444', organizationId: org.id },
  });
  const labelFeature = await prisma.label.create({
    data: { name: 'Feature', color: '#8b5cf6', organizationId: org.id },
  });

  // 4. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'DevFlow Platform',
      key: 'DEV',
      description: 'Core web application, API Gateway, and Socket.IO real-time engine',
      organizationId: org.id,
      ownerId: userOwner.id,
      members: {
        create: [
          { userId: userOwner.id, role: ProjectRole.LEAD },
          { userId: userAdmin.id, role: ProjectRole.LEAD },
          { userId: userDev.id, role: ProjectRole.DEVELOPER },
        ],
      },
      githubIntegration: {
        create: {
          repositoryName: 'devflow-io/devflow',
          repositoryUrl: 'https://github.com/devflow-io/devflow',
          isConnected: true,
        },
      },
    },
  });

  console.log('✅ Created project: DevFlow Platform (Key: DEV)');

  // 5. Create Realistic Issues
  const issue1 = await prisma.issue.create({
    data: {
      issueKey: 'DEV-101',
      issueNumber: 101,
      title: 'Implement Refresh Token Rotation and Revocation Strategy',
      description: 'Secure JWT access tokens with short expiry (15m) and long-lived refresh tokens (7d) stored in DB with SHA-256 hash.',
      status: IssueStatus.DONE,
      priority: IssuePriority.CRITICAL,
      type: IssueType.TASK,
      position: 1000,
      projectId: project.id,
      reporterId: userOwner.id,
      assigneeId: userOwner.id,
      labels: {
        create: [{ labelId: labelSecurity.id }, { labelId: labelBackend.id }],
      },
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      issueKey: 'DEV-102',
      issueNumber: 102,
      title: 'Build Drag-and-Drop Kanban Board with Real-time Socket Synchronization',
      description: 'Users should be able to drag cards across columns and instantly sync positions across all connected teammates via WebSockets.',
      status: IssueStatus.IN_REVIEW,
      priority: IssuePriority.HIGH,
      type: IssueType.FEATURE,
      position: 2000,
      projectId: project.id,
      reporterId: userAdmin.id,
      assigneeId: userDev.id,
      labels: {
        create: [{ labelId: labelFrontend.id }, { labelId: labelFeature.id }],
      },
    },
  });

  const issue3 = await prisma.issue.create({
    data: {
      issueKey: 'DEV-103',
      issueNumber: 103,
      title: 'GitHub Webhook Auto-Resolution Engine',
      description: 'Automatically parse commit messages containing "Fixes DEV-102" to transition DevFlow issue status to DONE.',
      status: IssueStatus.IN_PROGRESS,
      priority: IssuePriority.HIGH,
      type: IssueType.FEATURE,
      position: 3000,
      projectId: project.id,
      reporterId: userOwner.id,
      assigneeId: userDev.id,
      labels: {
        create: [{ labelId: labelBackend.id }, { labelId: labelFeature.id }],
      },
    },
  });

  const issue4 = await prisma.issue.create({
    data: {
      issueKey: 'DEV-104',
      issueNumber: 104,
      title: 'Fix issue filter dropdown reset on route change',
      description: 'When navigating back from issue detail page, selected status and priority filters should persist in state.',
      status: IssueStatus.TODO,
      priority: IssuePriority.MEDIUM,
      type: IssueType.BUG,
      position: 4000,
      projectId: project.id,
      reporterId: userAdmin.id,
      assigneeId: userAdmin.id,
      labels: {
        create: [{ labelId: labelFrontend.id }],
      },
    },
  });

  const issue5 = await prisma.issue.create({
    data: {
      issueKey: 'DEV-105',
      issueNumber: 105,
      title: 'Docker Compose environment optimization for Redis & PostgreSQL',
      description: 'Configure healthchecks and volume mounts for Docker Compose developer workflow.',
      status: IssueStatus.BACKLOG,
      priority: IssuePriority.LOW,
      type: IssueType.IMPROVEMENT,
      position: 5000,
      projectId: project.id,
      reporterId: userDev.id,
      assigneeId: null,
      labels: {
        create: [{ labelId: labelBackend.id }],
      },
    },
  });

  console.log('✅ Created 5 sample issues (DEV-101 to DEV-105)');

  // 6. Create Comments
  await prisma.comment.create({
    data: {
      issueId: issue2.id,
      authorId: userOwner.id,
      content: 'Great progress on the drag-and-drop animation! Let us make sure optimistic state updates feel smooth.',
    },
  });

  await prisma.comment.create({
    data: {
      issueId: issue2.id,
      authorId: userDev.id,
      content: 'Added `@hello-pangea/dnd` integration. Socket broadcast handles instant updates across browsers!',
    },
  });

  // 7. Create Activity Logs
  await prisma.activityLog.create({
    data: {
      organizationId: org.id,
      projectId: project.id,
      issueId: issue2.id,
      actorId: userDev.id,
      action: 'STATUS_CHANGED',
      details: JSON.stringify({ oldStatus: 'IN_PROGRESS', newStatus: 'IN_REVIEW', issueKey: 'DEV-102' }),
    },
  });

  // 8. Create Notification
  await prisma.notification.create({
    data: {
      userId: userDev.id,
      actorId: userAdmin.id,
      type: 'ASSIGNMENT',
      title: 'Assigned to DEV-102',
      message: 'You were assigned to issue "Build Drag-and-Drop Kanban Board"',
      link: `/projects/${project.id}/board?issue=${issue2.id}`,
    },
  });

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
