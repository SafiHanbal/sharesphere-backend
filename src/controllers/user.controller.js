import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

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

  const user = await User.findById(userId);

  res.status(200).json({
    status: 'success',
    data: {
      user,
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
    'bio',
    'profilePicture'
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
