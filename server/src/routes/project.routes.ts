import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireProjectRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema, addProjectMemberSchema } from '../validators';
import { ProjectRole } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createProjectSchema), projectController.create);
router.get('/', projectController.listByOrg);
router.get('/:id', requireProjectRole([ProjectRole.LEAD, ProjectRole.DEVELOPER, ProjectRole.VIEWER]), projectController.getById);
router.patch('/:id', requireProjectRole([ProjectRole.LEAD]), validate(updateProjectSchema), projectController.update);
router.delete('/:id', requireProjectRole([ProjectRole.LEAD]), projectController.delete);

router.post('/:id/members', requireProjectRole([ProjectRole.LEAD]), validate(addProjectMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', requireProjectRole([ProjectRole.LEAD]), projectController.removeMember);

router.get('/:id/activity', requireProjectRole([ProjectRole.LEAD, ProjectRole.DEVELOPER, ProjectRole.VIEWER]), projectController.getProjectActivity);

export default router;
