import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { Server } from 'socket.io';

dotenv.config({ path: 'config.env' });

const port = process.env.PORT || 8000;
const db = process.env.DB_URI.replace('<<PASSWORD>>', process.env.DB_PASSWORD);

mongoose
  .connect(db)
  .then(() => {
    console.log('DB connection successful!');

    const server = app.listen(port, () => {
      console.log(`App running on port: ${port}`);
    });

    // Socket for message functionality
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('a user joined');
      socket.on('joinRoom', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        socket.join(roomId);
      });

      socket.on('sendMessage', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        io.to(roomId).emit('receiveMessage', { recipientId });
      });

      socket.on('typing', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        io.to(roomId).emit('typing', { recipientId });
      });

      socket.on('stopTyping', ({ userId, recipientId }) => {
        const roomId = [userId, recipientId].sort().join('-');
        io.to(roomId).emit('stopTyping', { recipientId });
      });

      socket.on('disconnect', () => {
        console.log('a user is disconnected');
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
