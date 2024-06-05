import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';

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
    message: 'This route is not implemented yet.',
  });
});
export const updateUser = catchAsync(async (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'This route is not implemented yet.',
  });
});
export const deleteUser = catchAsync(async (req, res, next) => {
  res.status(400).json({
    status: 'fail',
    message: 'This route is not implemented yet.',
  });
});
