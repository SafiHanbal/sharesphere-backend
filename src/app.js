import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import express from 'express';

import userRouter from './routes/user.route.js';
import chatRouter from './routes/chat.route.js';
import messageRouter from './routes/message.route.js';
import postRouter from './routes/post.route.js';
import likeRouter from './routes/like.route.js';
import commentRouter from './routes/comment.route.js';

import globalErrorHandler from './controllers/error.controller.js';

const app = express();

app.use('/public', express.static(path.join('src', 'public')));

// Developement middlewares
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/comments', commentRouter);

// Error Handler
app.use(globalErrorHandler);

export default app;
