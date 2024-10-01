import { promisify } from 'util';
import { fileURLToPath } from 'url';

import path from 'path';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import catchAsync from '../utils/catchAsync.js';

import AppError from '../utils/AppError.js';
import User from '../models/user.model.js';

import { getMailMarkup } from '../utils/otpMailMarkup.js';

// Defining variable to access files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createAndSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  const user = await User.create({
    username,
    email,
    password,
    confirmPassword,
  });

  createAndSendToken(user, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password.', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return next(
      new AppError('No user found with the provided credentials.', 404)
    );

  if (!(await user.checkPassword(password, user.password)))
    return next(new AppError('Please enter correct password.', 400));

  createAndSendToken(user, 200, res);
});

export const logout = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'You are logged out successfully.',
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError('There is no user with provided email.', 404));

  // Creating and saving encrypted otp in database
  const OTP = await user.createOTP();
  await user.save({ validateBeforeSave: false });

  // Setting up sending otp email
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const html = getMailMarkup(OTP);

  var mailOptions = {
    from: '"ShareSphere"',
    to: email,
    subject: 'OTP to change Password',
    // text: `Your OTP to reset the password is ${OTP}. (Only valid for 10 minutes)`,
    attachments: [
      {
        filename: 'Logo.png',
        path: `${__dirname}/../assets/logo/logo.png`,
        cid: 'logo', //my mistake was putting "cid:logo@cid" here!
      },
    ],
    html,
  };

  // Sending otp mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(400).json({
        status: 'fail',
        message: 'Unable to send OTP. Please try again later.',
      });
    } else {
      res.status(200).json({
        status: 'success',
        message: 'We have sent an OTP to your email address.',
      });
    }
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, confirmPassword } = req.body;

  // Check otp with encrypted reset token
  const user = await User.findOne({ email });

  const validateOTP = await user.checkOTP(otp, next);

  // if matched reset password
  if (!validateOTP) return next(new AppError('Incorrect OTP.', 400));

  // Updating fields in user document to save in db
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated! Please login using new password.',
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!currentPassword || !newPassword || !confirmPassword)
    return next(new AppError('Please provide necessary details.', 400));

  // Validating current password
  if (!(await user.checkPassword(currentPassword, user.password)))
    return next(new AppError('Please provide correct current password.', 400));

  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();

  createAndSendToken(user, 200, res);
});

// Protect route from unauthenticated requests
export const protect = catchAsync(async (req, res, next) => {
  // Check for bearer jwt token
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  )
    return next(
      new AppError('You are not logged in. Please login to continue.', 401)
    );

  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded._id);

  // Check if user no longer exists.
  if (!user)
    return next(
      new AppError('User associated to this token no longer exists.', 401)
    );

  // Check if user changed password after the token issued
  if (await user.changedPasswordAfter(decoded.iat))
    next(
      new AppError('User recently changed password. Please login again.', 401)
    );

  req.user = user;
  next();
});

// Strict route to admin
export const strictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You are not allowed to access this route', 400)
      );
    next();
  };
