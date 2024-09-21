import express from 'express';

import { protect } from '../controllers/auth.controller.js';
import {
  getAllComments,
  createComment,
  getComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getAllComments).post(createComment);
router.route('/:id').get(getComment).patch(updateComment).delete(deleteComment);

export default router;
