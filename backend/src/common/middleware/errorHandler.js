const logger = require('../config/logger');

function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  logger.error({ err, reqId: req.id }, `${statusCode} - ${err.message}`);

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
    });
  }

  res.status(statusCode).json({
    error: { code, message: err.message },
  });
}

module.exports = errorHandler;
