import express from 'express';

import { protect } from '../controllers/auth.controller.js';
import {
  sendMessage,
  getAllMessages,
} from '../controllers/message.controller.js';

const router = express.Router();

router.use(protect);

router.route('/').post(sendMessage);
router.route('/:chatId').get(getAllMessages);

export default router;
