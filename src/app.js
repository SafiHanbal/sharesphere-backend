import cors from 'cors';
import morgan from 'morgan';
import express from 'express';

import userRouter from './routes/user.route.js';
import chatRouter from './routes/chat.route.js';
import messageRouter from './routes/message.route.js';

import globalErrorHandler from './controllers/error.controller.js';

const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);
app.use('/api/v1/messages', messageRouter);

app.use(globalErrorHandler);

export default app;
