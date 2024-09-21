import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import Comment from '../models/comment.model.js';

export const getAllComments = catchAsync(async (req, res, next) => {
  const comments = await Comment.find();

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments,
    },
  });
});

export const createComment = catchAsync(async (req, res, next) => {
  const user = req.user._id;

  const comment = await Comment.create({ user, ...req.body });

  res.status(201).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

export const getComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) return next(new AppError('Required comment not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

export const updateComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findByIdAndUpdate(id, req.body, { new: true });

  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

export const deleteComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await Comment.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    message: 'Comment deleted successfully.',
  });
});
