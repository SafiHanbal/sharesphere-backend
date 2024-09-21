import mongoose from 'mongoose';
import Post from './post.model.js';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user.'],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Please provide a post.'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that one user can only like one post once
likeSchema.index({ user: 1, post: 1 }, { unique: true });

likeSchema.pre('save', async function (next) {
  const like = this;

  try {
    const likeCount = await mongoose
      .model('Like')
      .countDocuments({ post: like.post });

    await Post.findByIdAndUpdate(like.post, { likesCount: likeCount + 1 });
  } catch (err) {
    next(err);
  }
});

likeSchema.post('findOneAndDelete', async function (deletedLike) {
  if (deletedLike) {
    try {
      const likesCount = await mongoose
        .model('Like')
        .countDocuments({ post: deletedLike.post });

      await Post.findByIdAndUpdate(deletedLike.post, {
        likesCount,
      });
    } catch (err) {
      console.error('Error updating likeCounts after deletion:', err);
    }
  }
});

const Like = mongoose.model('Like', likeSchema);

export default Like;
