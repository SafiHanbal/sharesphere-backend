import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Like from '../models/like.model.js';

export const getAllLikes = catchAsync(async (req, res, next) => {
  const likes = await Like.find();

  res.status(200).json({
    status: 'success',
    results: likes.length,
    data: {
      likes,
    },
  });
});

export const createLike = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const { post } = req.body;

  const like = await Like.create({ user, post });

  res.status(201).json({
    status: 'success',
    data: {
      like,
    },
  });
});

export const getLike = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const like = await Like.findById(id);

  if (!like) return next(new AppError('Required like not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      like,
    },
  });
});

export const deleteLike = catchAsync(async (req, res, next) => {
  const currentUserId = req.user._id;
  const { id } = req.params;

  await Like.findOneAndDelete({ user: currentUserId, post: id });

  res.status(204).json({
    status: 'success',
    message: 'Like deleted successfully.',
  });
});
