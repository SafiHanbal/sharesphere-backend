import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';

export const sendMessage = catchAsync(async (req, res, next) => {
  const { _id: currentUserId } = req.user;
  const { chatId, content } = req.body;

  if (!chatId || !content)
    return next(new AppError('Please provide chatId and content', 400));

  const message = await Message.create({
    sender: currentUserId,
    chat: chatId,
    content,
  });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

export const getAllMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});
