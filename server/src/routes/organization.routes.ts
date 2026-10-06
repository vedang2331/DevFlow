import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireOrgRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrgSchema, inviteOrgMemberSchema, updateOrgMemberRoleSchema } from '../validators';
import { OrgRole } from '../types';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createOrgSchema), organizationController.create);
router.get('/', organizationController.list);
router.get('/:id', organizationController.getById);

router.post('/:id/members', requireOrgRole([OrgRole.OWNER, OrgRole.ADMIN]), validate(inviteOrgMemberSchema), organizationController.inviteMember);
router.patch('/:id/members/:userId', requireOrgRole([OrgRole.OWNER, OrgRole.ADMIN]), validate(updateOrgMemberRoleSchema), organizationController.updateMemberRole);
router.delete('/:id/members/:userId', requireOrgRole([OrgRole.OWNER, OrgRole.ADMIN]), organizationController.removeMember);

export default router;
