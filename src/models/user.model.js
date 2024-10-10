import { promisify } from 'util';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import AppError from '../utils/AppError.js';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'A user must have a username.'],
      unique: [true, 'This username is aleady taken. Try something else.'],
    },
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    bio: String,
    profilePicture: String,
    email: {
      type: String,
      required: [true, 'A user must have an email.'],
      unique: [true, 'This email already has an account. Please login.'],
    },

    followersCount: {
      type: Number,
      default: 0,
    },
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    postCount: {
      type: Number,
      default: 0,
    },
    authType: {
      type: String,
      enum: {
        values: ['email-password', 'google', 'facebook'],
        message: 'Auth type can only be email-password, google or facebook',
      },
      default: 'email-password',
    },
    password: {
      type: String,
      select: false,
    },
    confirmPassword: {
      type: String,
      validate: {
        message: 'Passwords do not match.',
        validator: function (val) {
          return this.password === val;
        },
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

// Virtual populate to get associated posts
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

// Encrypting user's password on signup
userSchema.pre('save', async function (next) {
  // returnting if there is no password for login with google and facebook
  if (!this.password) next();

  if (!this.isModified('password')) return next();

  this.password = await promisify(bcrypt).hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

userSchema.methods.checkPassword = async function (
  canditatePassword,
  savedPassword
) {
  return await bcrypt.compare(canditatePassword, savedPassword);
};

userSchema.methods.createOTP = async function () {
  const OTP = String(Math.floor(Math.random() * (999999 - 100000) + 100000));
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(OTP)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return OTP;
};

userSchema.methods.checkOTP = async function (OTP, next) {
  if (Date.now() > this.passwordResetExpires)
    return next(new AppError('OTP expired request a new OTP.', 400));

  const hashedToken = crypto
    .createHash('sha256')
    .update(String(OTP))
    .digest('hex');

  return this.passwordResetToken === hashedToken;
};

// Check if the password is changed after the token is created
userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
