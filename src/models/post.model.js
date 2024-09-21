import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import mongoose from 'mongoose';
import Like from './like.model.js';
import Comment from './comment.model.js';

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

// Virtual populate to get associated comments
postSchema.virtual('comments', {
  ref: 'Comment', // The model to use
  localField: '_id', // The field in the Post model
  foreignField: 'post', // The field in the Comment model that references the Post
  justOne: false, // This means we expect an array of comments
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

const Post = mongoose.model('Post', postSchema);

export default Post;
