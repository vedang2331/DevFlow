import { Router } from 'express';
import authRoutes from './auth.routes';
import organizationRoutes from './organization.routes';
import projectRoutes from './project.routes';
import issueRoutes from './issue.routes';
import commentRoutes from './comment.routes';
import notificationRoutes from './notification.routes';
import githubRoutes from './github.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/projects', projectRoutes);
router.use('/', issueRoutes);
router.use('/', commentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', githubRoutes);

export default router;
