const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../errors/AppError');

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, config.jwt.secret);
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

module.exports = authenticate;
