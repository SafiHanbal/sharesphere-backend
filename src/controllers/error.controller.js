import AppError from '../utils/AppError.js';

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  const value = Object.values(err.keyValue).join(', ');
  const message = `Field (${field}) have duplicate value (${value}). Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const message = Object.keys(err.errors)
    .map((el) => err.errors[el].message)
    .join(', ');

  return new AppError(message, 400);
};

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
};

const sendErrorProd = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong.',
  });
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(res, err);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;

    console.log(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    sendErrorProd(res, error);
  }
};
