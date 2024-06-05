import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'A user must have a username.'],
    unique: [true, 'This username is aleady taken. Try something else.'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email.'],
    unique: [true, 'This email already has an account. Please login.'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password.'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password.'],
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
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
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

userSchema.methods.checkOTP = async function (
  passwordResetToken,
  passwordResetExpires,
  OTP,
  next
) {
  if (Date.now() > passwordResetExpires)
    return next(new AppError('OTP expired request a new OTP.', 400));
  const hashedToken = crypto.createHash('sha256').update(OTP).digest('hex');

  return passwordResetToken === hashedToken;
};

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
