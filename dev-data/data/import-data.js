import { readFileSync } from 'fs';
import { connect } from 'mongoose';
import { config } from 'dotenv';

import User from '../../src/models/user.model.js';

config({ path: `./config.env` });

const DB = process.env.DB_URI.replace('<<PASSWORD>>', process.env.DB_PASSWORD);

connect(DB)
  .then(() => console.log('Connected to DB!'))
  .catch((err) => console.log(err.message));

const importDataToDB = async () => {
  try {
    const userData = JSON.parse(
      readFileSync('./dev-data/data/users.json', {
        encoding: 'utf-8',
      })
    );

    const user = await User.create(userData, { validateBeforeSave: false });

    if (user) console.log('User data imported successfully!');
  } catch (err) {
    console.log(err.message, err);
  }
  process.exit();
};

const deleteDataFromDB = async () => {
  try {
    await User.deleteMany();

    console.log('User data deleted successfully!');
  } catch (err) {
    console.log(err.message, err);
  }
  process.exit();
};

if (process.argv[2] === '--import') importDataToDB();
if (process.argv[2] === '--delete') deleteDataFromDB();
if (process.argv[2] === '--importRating') importRating();
