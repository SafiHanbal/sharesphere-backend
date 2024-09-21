import express from 'express';

import { protect } from '../controllers/auth.controller.js';
import {
  getAllLikes,
  createLike,
  getLike,
  deleteLike,
} from '../controllers/like.controller.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getAllLikes).post(createLike);
router.route('/:id').get(getLike).delete(deleteLike);

export default router;
