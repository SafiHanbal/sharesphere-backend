import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';
import AppError from '../utils/AppError.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'This route is not implemented yet.',
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
