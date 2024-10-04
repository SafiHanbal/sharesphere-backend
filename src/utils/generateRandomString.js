import crypto from 'crypto';

// Function to generate a random string
export default (length) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};
