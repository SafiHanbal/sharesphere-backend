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
  upload,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfilePicture,
  searchUser,
  follow,
  unfollow,
} from '../controllers/user.controller.js';

const router = express.Router();

// Authentication routes
router.route('/login').post(login);
router.route('/sign-up').post(signUp);
router.route('/logout').get(protect, logout);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/update-password').post(protect, updatePassword);

// Follow routes
router.route('/follow/:userId').get(protect, follow);
router.route('/unfollow/:userId').get(protect, unfollow);

// User routes
router.route('/profile-picture').patch(protect, upload, updateProfilePicture);
router.route('/search/:username').get(protect, searchUser);
router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:userId')
  .get(protect, getUser)
  .patch(protect, updateUser)
  .delete(protect, deleteUser);

export default router;
