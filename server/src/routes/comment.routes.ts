import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCommentSchema, updateCommentSchema } from '../validators';

const router = Router();

router.use(requireAuth);

router.get('/issues/:issueId/comments', commentController.getComments);
router.post('/issues/:issueId/comments', validate(createCommentSchema), commentController.addComment);
router.patch('/comments/:id', validate(updateCommentSchema), commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);

export default router;
