import { Router } from 'express';
import { gitHubController } from '../controllers/github.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireProjectRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { githubConnectSchema } from '../validators';
import { ProjectRole } from '../types';

const router = Router();

// Webhook endpoint is public
router.post('/webhooks/github', gitHubController.handleWebhook);

// Protected routes
router.use(requireAuth);

router.post('/projects/:projectId/github/connect', requireProjectRole([ProjectRole.LEAD]), validate(githubConnectSchema), gitHubController.connect);
router.get('/projects/:projectId/github', requireProjectRole([ProjectRole.LEAD, ProjectRole.DEVELOPER, ProjectRole.VIEWER]), gitHubController.getDetails);
router.delete('/projects/:projectId/github', requireProjectRole([ProjectRole.LEAD]), gitHubController.disconnect);

export default router;
