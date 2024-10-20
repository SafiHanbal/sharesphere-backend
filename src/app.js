import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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
if (process.env.NODE_ENV === 'development') {
  const { default: morgan } = await import('morgan');
  app.use(morgan('dev'));
}

// Middlewares
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

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
