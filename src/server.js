import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config({ path: 'config.env' });

const port = process.env.PORT || 8000;
const db = process.env.DB_URI.replace('<<PASSWORD>>', process.env.DB_PASSWORD);

mongoose
  .connect(db)
  .then(() => {
    console.log('DB connection successful!');
    app.listen(port, () => {
      console.log(`App running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
