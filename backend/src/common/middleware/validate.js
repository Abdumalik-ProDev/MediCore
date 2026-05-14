const AppError = require('../errors/AppError');

function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      return next(new AppError(message, 400, 'VALIDATION_ERROR'));
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
