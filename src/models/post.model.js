import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import Like from './like.model.js';
import Comment from './comment.model.js';
import User from './user.model.js';

// This gets the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user.'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide images.'],
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Virtual populate to get associated likes
postSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post',
  justOne: true,
});

// Virtual populate to get associated comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  justOne: false,
});

// Deleting all associated likes and comments if a post is deleted
postSchema.post('findOneAndDelete', async function (deletedPost) {
  if (!deletedPost) return;

  try {
    await Like.deleteMany({ post: deletedPost._id });
    await Comment.deleteMany({ post: deletedPost._id });

    // Delete associated images
    if (deletedPost.images && deletedPost.images.length > 0) {
      deletedPost.images.forEach(async (image) => {
        const imagePath = path.join(__dirname, '../public/images/post', image);

        await fs.unlink(imagePath);
      });
    }
  } catch (err) {
    console.error('Error while deleting associated resources:', err);
  }
});

postSchema.pre('save', async function (next) {
  const post = this;

  try {
    const postCount = await mongoose
      .model('Post')
      .countDocuments({ user: post.user });

    await User.findByIdAndUpdate(post.user, { postCount: postCount + 1 });
  } catch (err) {
    next(err);
  }
});

postSchema.post('findOneAndDelete', async function (deletedPost) {
  if (deletedPost) {
    try {
      const postCount = await mongoose
        .model('Post')
        .countDocuments({ user: deletedPost.user });

      await User.findByIdAndUpdate(deletedPost.user, {
        postCount,
      });
    } catch (err) {
      console.error('Error updating likeCounts after deletion:', err);
    }
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;
