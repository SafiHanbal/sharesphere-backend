import express from 'express';

import { protect } from '../controllers/auth.controller.js';
import {
  upload,
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getAllPosts).post(upload, createPost);
router.route('/:id').get(getPost).patch(updatePost).delete(deletePost);

export default router;
