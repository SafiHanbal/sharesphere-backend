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
        origin: [process.env.FRONTEND_URL],
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      socket.on('register', ({ userId }) => {
        userSocketMap[userId] = socket.id;
      });

      socket.on('logout', () => {
        removeFromSocketMap(socket);
      });

      socket.on('disconnect', (reason) => {
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
      socket.on('start-call', ({ caller, recipientId, callType, offer }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket
          .to(recipientSocketId)
          .emit('incoming-call', { caller, callType, offer });
      });

      socket.on('set-accept-call', ({ recipientId, answer }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-accept-call', { answer });
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

      socket.on('set-negotiation-needed', ({ recipientId, offer }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-negotiation-needed', { offer });
      });

      socket.on('set-negotiation-done', ({ recipientId, answer }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-negotiation-done', { answer });
      });

      socket.on('set-candidate', ({ recipientId, candidate }) => {
        const recipientSocketId = userSocketMap[recipientId];

        if (!recipientSocketId) return;
        socket.to(recipientSocketId).emit('get-candidate', { candidate });
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
