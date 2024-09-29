import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';

export const getChats = catchAsync(async (req, res, next) => {
  const { _id: currentUserId } = req.user;
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: currentUserId } },
  })
    .populate({
      path: 'users',
      select: 'firstName lastName profilePicture',
    })
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: chats.length,
    data: {
      chats,
    },
  });
});

export const accessChat = catchAsync(async (req, res, next) => {
  const { _id: currentUserId } = req.user;
  const { userId } = req.body;

  const chats = await Chat.find({
    isGroupChat: false,
    $and: [{ users: currentUserId }, { users: userId }],
  }).populate({
    path: 'users',
    select: 'firstName lastName profilePicture',
  });

  if (!chats.length) {
    // Creating new chat
    const newChat = await Chat.create({
      users: [currentUserId, userId],
    });

    // Populating users in chat
    const chat = await Chat.findById(newChat._id).populate({
      path: 'users',
      select: 'firstName lastName profilePicture',
    });

    res.status(201).json({
      status: 'success',
      data: {
        chat,
      },
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        chat: chats[0],
      },
    });
  }
});
