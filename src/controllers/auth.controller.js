import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import User from '../models/user.model.js';

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
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password)
    return next(new AppError('Please provide email and password.'));

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).select('+password');

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

  const OTP = await user.createOTP();
  await user.save({ validateBeforeSave: false });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: '"ShareSphere"',
    to: email,
    subject: 'OTP to change Password',
    text: `Your OTP to reset the password is ${OTP}. (Only valid for 10 minutes)`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.status(400).json({
        status: 'fail',
        message: 'Unable to send OTP. Please try again later.',
      });
    } else {
      console.log('Email sent: ' + info.response);
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
  const validateOTP = await user.checkOTP(
    user.passwordResetToken,
    user.passwordResetExpires,
    otp,
    next
  );

  // if matched reset password
  if (!validateOTP) return next(new AppError('Incorrect OTP.', 400));

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();

  createAndSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!currentPassword || !newPassword || !confirmPassword)
    return next(new AppError('Please provide necessary details.', 400));

  if (!(await user.checkPassword(currentPassword, user.password)))
    return next(new AppError('Please provide correct current password.', 400));

  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  user.save();

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
