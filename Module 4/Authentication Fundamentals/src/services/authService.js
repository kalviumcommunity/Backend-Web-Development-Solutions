const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const AppError = require('../errors/AppError');

const cost = Number(process.env.BCRYPT_COST || 12);
if (!Number.isInteger(cost) || cost < 4 || cost > 31) {
  throw new Error('BCRYPT_COST must be an integer from 4 to 31');
}
// Precompute once. Missing-account login still performs comparable bcrypt work.
const dummyHashPromise = bcrypt.hash('not-a-real-account-password', cost);

function requiredString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function invalidCredentials() {
  return new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
}

async function register(input = {}) {
  if (!requiredString(input.name) || !requiredString(input.email) || !requiredString(input.password)) {
    throw new AppError(400, 'INVALID_INPUT', 'Name, email, and password are required');
  }
  if (bcrypt.truncates(input.password)) {
    throw new AppError(400, 'PASSWORD_TOO_LONG', 'Password exceeds bcrypt\'s 72-byte input limit');
  }
  const email = input.email.trim().toLowerCase();
  if (await userRepository.findByEmail(email)) {
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  }
  const passwordHash = await bcrypt.hash(input.password, cost);
  try {
    const user = await userRepository.create({ name: input.name.trim(), email, passwordHash });
    return publicUser(user);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }
    throw error;
  }
}

async function login(input = {}) {
  if (!requiredString(input.email) || !requiredString(input.password)) {
    throw new AppError(400, 'INVALID_INPUT', 'Email and password are required');
  }
  if (bcrypt.truncates(input.password)) throw invalidCredentials();
  const email = input.email.trim().toLowerCase();
  const user = await userRepository.findByEmail(email);
  const passwordHash = user ? user.passwordHash : await dummyHashPromise;
  const valid = await bcrypt.compare(input.password, passwordHash);
  if (!user || !valid) throw invalidCredentials();
  return publicUser(user);
}

module.exports = { register, login };
