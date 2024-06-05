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
} from '../controllers/user.controller.js';

const router = express.Router();

router.route('/login').post(login);
router.route('/signup').post(signUp);
router.route('/logout').get(protect, logout);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/update-password').post(protect, updatePassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:userId').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
