import { readFileSync } from 'fs';
import { connect } from 'mongoose';
import { config } from 'dotenv';

import User from '../../src/models/user.model.js';
import Chat from '../../src/models/chat.model.js';
import Comment from '../../src/models/comment.model.js';
import Like from '../../src/models/like.model.js';
import Message from '../../src/models/message.model.js';
import Post from '../../src/models/post.model.js';

config({ path: `./config.env` });

const DB = process.env.DB_URI.replace('<<PASSWORD>>', process.env.DB_PASSWORD);

connect(DB)
  .then(() => console.log('Connected to DB!'))
  .catch((err) => console.log(err.message));

// Note: Please comment out password encryption functionlity from User model
// and Like count on like creating and deletion from Like model
// and Post count on post creating and deletion from Post model
const importDataToDB = async () => {
  try {
    // Reading data
    const userData = JSON.parse(
      readFileSync('./dev-data/data/users.json', {
        encoding: 'utf-8',
      })
    );

    const chatData = JSON.parse(
      readFileSync('./dev-data/data/chats.json', {
        encoding: 'utf-8',
      })
    );

    const messageData = JSON.parse(
      readFileSync('./dev-data/data/messages.json', {
        encoding: 'utf-8',
      })
    );

    const postData = JSON.parse(
      readFileSync('./dev-data/data/posts.json', {
        encoding: 'utf-8',
      })
    );

    const commentData = JSON.parse(
      readFileSync('./dev-data/data/comments.json', {
        encoding: 'utf-8',
      })
    );

    const likeData = JSON.parse(
      readFileSync('./dev-data/data/likes.json', {
        encoding: 'utf-8',
      })
    );

    console.log('Importing data! process will be completed in a min');

    // Uploading to db
    const user = await User.create(userData, { validateBeforeSave: false });
    if (user) console.log('User data imported successfully!');

    const chat = await Chat.create(chatData);
    if (chat) console.log('Chat data imported successfully!');

    const message = await Message.create(messageData);
    if (message) console.log('Messages data imported successfully!');

    const post = await Post.create(postData);
    if (post) console.log('Post data imported successfully!');

    const comment = await Comment.create(commentData);
    if (comment) console.log('Comment data imported successfully!');

    const like = await Like.create(likeData);
    if (like) console.log('Like data imported successfully!');
  } catch (err) {
    console.log(err.message, err);
  }

  setTimeout(() => {
    process.exit();
  }, 60000);
};

const deleteDataFromDB = async () => {
  try {
    await User.deleteMany();
    console.log('User data deleted successfully!');

    await Chat.deleteMany();
    console.log('Chat data deleted successfully!');

    await Comment.deleteMany();
    console.log('Comment data deleted successfully!');

    await Like.deleteMany();
    console.log('Like data deleted successfully!');

    await Message.deleteMany();
    console.log('Message data deleted successfully!');

    await Post.deleteMany();
    console.log('Post data deleted successfully!');
  } catch (err) {
    console.log(err.message, err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importDataToDB();
if (process.argv[2] === '--delete') deleteDataFromDB();
if (process.argv[2] === '--importRating') importRating();
