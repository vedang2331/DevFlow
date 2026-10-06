import { Router } from 'express';
import { issueController } from '../controllers/issue.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireProjectRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createIssueSchema, updateIssueSchema, reorderIssueSchema } from '../validators';
import { ProjectRole } from '../types';

const router = Router();

router.use(requireAuth);

router.get('/projects/:projectId/issues', requireProjectRole([ProjectRole.LEAD, ProjectRole.DEVELOPER, ProjectRole.VIEWER]), issueController.list);
router.post('/projects/:projectId/issues', requireProjectRole([ProjectRole.LEAD, ProjectRole.DEVELOPER]), validate(createIssueSchema), issueController.create);

router.get('/issues/key/:key', issueController.getByKey);
router.get('/issues/:id', issueController.getById);
router.patch('/issues/:id', validate(updateIssueSchema), issueController.update);
router.patch('/issues/:id/reorder', validate(reorderIssueSchema), issueController.reorder);
router.delete('/issues/:id', issueController.delete);

export default router;
