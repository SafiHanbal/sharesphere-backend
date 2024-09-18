import express from 'express';

import { protect } from '../controllers/auth.controller.js';
import { getChats, accessChat } from '../controllers/chat.controller.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getChats).post(accessChat);

export default router;
