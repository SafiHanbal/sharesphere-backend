import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

import Post from '../models/post.model.js';
import Like from '../models/like.model.js';

// This gets the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup for images
const storage = multer.memoryStorage();
export const upload = multer({ storage }).array('images');

export const getAllPosts = catchAsync(async (req, res, next) => {
  const { _id: currentUserId, following } = req.user;

  const postsOfFollowingUser = Post.find({ user: { $in: following } });

  const query = new APIFeatures(postsOfFollowingUser, req.query)
    .filter()
    .sort()
    .limit()
    .paginate().query;

  const posts = await query
    .populate({
      path: 'user',
      select: 'profilePicture firstName lastName',
    })
    .populate({
      path: 'likes',
      match: { user: currentUserId },
    })
    .populate({
      path: 'comments',
      match: { user: currentUserId },
      populate: {
        path: 'user',
        select: 'firstName lastName profilePicture',
      },
    })
    .lean();

  const postWithIsLiked = posts.map((post) => ({
    ...post,
    isLiked: !!post.likes,
  }));

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: {
      posts: postWithIsLiked,
    },
  });
});

export const createPost = catchAsync(async (req, res, next) => {
  const currentUserId = req.user._id;
  const images = req.files;
  const imagePaths = [];

  // Check if images are uploaded
  if (!images || images.length === 0)
    return next(new AppError('Please provide images', 400));

  // Loop through images and resize each
  for (const [index, file] of images.entries()) {
    const filename = `post-${currentUserId}-${Date.now()}-${index}.jpeg`;

    const postDir = path.join(__dirname, '../public/images/post');
    const outputPath = path.join(postDir, filename);

    // Resize image using sharp and set it to 800x600px with object fit: cover
    await sharp(file.buffer)
      .resize(800, 600, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Save image path for post
    imagePaths.push(filename);
  }

  const { caption } = req.body;
  const post = await Post.create({
    user: currentUserId,
    caption,
    images: imagePaths,
  });

  res.status(201).json({
    status: 'success',
    data: {
      post,
    },
  });
});

export const getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  const post = await Post.findById(id)
    .populate({
      path: 'user',
      select: 'firstName lastName profilePicture',
    })
    .populate({
      path: 'comments',
      populate: { path: 'user', select: 'firstName lastName profilePicture' },
    });

  if (!post) return next(new AppError('Required post not found.', 404));

  // Check for logged in user's like
  let isLiked = false;
  const like = await Like.findOne({ post: id, user: currentUserId });
  isLiked = !!like;

  // Sorting comments to have logged in user's comment at last
  const otherComments = post.comments.filter(
    (comment) => String(currentUserId) !== String(comment.user._id)
  );

  const userComments = post.comments.filter(
    (comment) => String(currentUserId) === String(comment.user._id)
  );

  res.status(200).json({
    status: 'success',
    data: {
      post: {
        ...post.toObject(),
        isLiked,
        comments: [...otherComments, ...userComments],
      },
    },
  });
});

export const updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.images && req.body.images.length > 0)
    return next(
      new AppError('Images can not be updated with this route.', 400)
    );

  const post = await Post.findByIdAndUpdate(id, req.body, { new: true });

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await Post.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    message: 'Post deleted successfully.',
  });
});
