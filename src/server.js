import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { Server } from 'socket.io';

dotenv.config({ path: 'config.env' });

const port = process.env.PORT || 8000;
const db = process.env.DB_URI.replace('<<PASSWORD>>', process.env.DB_PASSWORD);

const userSocketMap = {};

const removeFromSocketMap = (socket) => {
  for (const userId of Object.keys(userSocketMap)) {
    if (userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      break;
    }
  }
};

mongoose
  .connect(db)
  .then(() => {
    console.log('DB connection successful!');

    const server = app.listen(port, () => {
      console.log(`App running on port: ${port}`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: ['http://localhost:5173', 'https://localhost:5173'],
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('user connected', socket.id);

      socket.on('register', ({ userId }) => {
        userSocketMap[userId] = socket.id;
      });

      socket.on('logout', () => {
        removeFromSocketMap(socket);
      });

      socket.on('disconnect', (reason) => {
        console.log('user disconnected', reason);
        removeFromSocketMap(socket);
      });

      // Room for one on one chat
      socket.on('join-room', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        socket.join(roomId);
      });

      // Socket for message functionality
      socket.on('send-message', ({ userId, recipientId, message }) => {
        const roomId = [userId, recipientId].sort().join('-');

        socket.to(roomId).emit('receive-message', {
          message,
          recipientId,
        });
      });

      socket.on('set-typing-start', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        socket.to(roomId).emit('get-typing-start', { recipientId });
      });

      socket.on('set-typing-stop', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        socket.to(roomId).emit('get-typing-stop', { recipientId });
      });

      // Socket for call functionality
      socket.on('start-call', ({ caller, recipientId, callType }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket
          .to(recipientSocketId)
          .emit('incoming-call', { caller, callType });
      });

      socket.on('set-accept-call', ({ recipientId }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-accept-call');
      });

      socket.on('set-end-call', ({ recipientId }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-end-call');
      });

      socket.on('set-reject-call', ({ recipientId }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-reject-call');
      });

      socket.on('set-line-busy', ({ recipientId }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-line-busy');
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
