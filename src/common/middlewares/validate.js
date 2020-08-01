// @ts-nocheck
const joi = require('@hapi/joi');
const ApiError = require('../api-error');

function validate(schema) {
  return (req, res, next) => {
    const value = req.params.id ? { id: req.params.id } : req.query;
    const result = joi.validate(value, schema, { stripUnknown: true, abortEarly: false });

    if (result.error) {
      next(ApiError.badRequest('Ошибка валидации HTTP-запроса', result.error.details));
    } else if (req.params.id) {
      req.params.id = result.value.id;
    } else {
      req.query = result.value;
    }

    next();
  };
}

module.exports = validate;
