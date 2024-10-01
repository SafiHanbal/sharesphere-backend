import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

// This gets the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for images
const storage = multer.memoryStorage();
export const upload = multer({ storage }).single('profilePicture');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate().query;

  const users = await query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Querying required user's data
  const user = await User.findById(userId).populate({
    path: 'posts',
    options: { sort: { createdAt: -1 } },
  });

  // Checking if logged in user follows other user
  const isFollowing = req.user.following.includes(userId);

  res.status(200).json({
    status: 'success',
    data: {
      user: { ...user.toObject(), isFollowing },
    },
  });
});

export const createUser = catchAsync(async (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'This route is not for creating user! Instead use sign up.',
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('This route is not for password update.', 400));

  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'dateOfBirth',
    'username',
    'bio'
  );

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'This route is not implemented yet.',
  });
});

export const updateProfilePicture = catchAsync(async (req, res, next) => {
  const currentUserId = req.user._id;
  const profilePicture = req.file;

  // Check if there is an image
  if (!profilePicture)
    return next(new AppError('Please provide a profile picture', 400));

  // Delete previous profile picture
  if (req.user.profilePicture) {
    const imagePath = path.join(
      __dirname,
      '../public/images/user',
      req.user.profilePicture
    );

    await fs.unlink(imagePath);
  }

  // Nameing profile picture
  const filename = `user-${currentUserId}-${Date.now()}.jpeg`;

  const userDir = path.join(__dirname, '../public/images/user');
  const outputPath = path.join(userDir, filename);

  // Resize and Save Profile Picture
  await sharp(profilePicture.buffer)
    .resize(500, 500, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  // Save Profile Picture name in user's document
  const user = await User.findByIdAndUpdate(
    currentUserId,
    { profilePicture: filename },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const searchUser = catchAsync(async (req, res, next) => {
  const { _id: currentUserId } = req.user;
  const { username } = req.params;

  const query = new APIFeatures(
    User.find({
      $and: { _id: { $ne: currentUserId } },
      $or: [
        { username: { $regex: username, $options: 'i' } },
        { firstName: { $regex: username, $options: 'i' } },
        { lastName: { $regex: username, $options: 'i' } },
      ],
    }),
    req.query
  )
    .filter()
    .sort()
    .limit()
    .paginate().query;

  const users = await query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const follow = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // Check if logged in user is same as user to follow
  if (userId === currentUserId)
    return next(new AppError('You can not follow yourself', 400));

  // Check if user already follows the user
  if (req.user.following.includes(userId))
    return next(new AppError('You already follow the user.', 400));

  // Chekc if user to follow exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow)
    return next(new AppError('User to follow does not exists', 404));

  // Update following array field in logged in user's document
  const updatedUser = await User.findByIdAndUpdate(
    currentUserId,
    {
      $addToSet: { following: userId },
    },
    { new: true }
  );

  // Update followersCount in the other user's document
  await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const unfollow = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  // Check if logged in user is same as user to follow
  if (userId === currentUserId)
    return next(new AppError('You can not follow yourself', 400));

  // Check if user follows the user
  if (!req.user.following.includes(userId))
    return next(new AppError('You do not follow the user.', 400));

  // Check if user to follow exists
  const userToFollow = await User.findById(userId);
  if (!userToFollow)
    return next(new AppError('User to unfollow does not exists', 404));

  // Update following array field in logged in user's document
  const updatedUser = await User.findByIdAndUpdate(
    currentUserId,
    {
      $pull: { following: userId },
    },
    { new: true }
  );

  // Update followersCount in the other user's document
  await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
