import express from 'express';
import {
  signUp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  protect,
  strictTo,
  updatePassword,
} from '../controllers/auth.controller.js';

import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  searchUser,
} from '../controllers/user.controller.js';

const router = express.Router();

// Authentication routes
router.route('/login').post(login);
router.route('/sign-up').post(signUp);
router.route('/logout').get(protect, logout);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/update-password').post(protect, updatePassword);

// User routes
router.route('/search/:username').get(protect, searchUser);
router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:userId')
  .get(getUser)
  .patch(protect, updateUser)
  .delete(protect, deleteUser);

export default router;
