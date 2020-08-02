// @ts-nocheck
const joi = require('@hapi/joi');
const ApiError = require('../api-error');

const validate = schema => {
  return (req, res, next) => {
    let key = '';
    let result = {};
    let value = {};

    if (!req.params.id) {
      key = req.method === 'GET' ? 'query' : 'body';
      value = req[key];
    } else {
      value = { id: req.params.id };
    }

    result = joi.validate(value, schema, { stripUnknown: true, abortEarly: false });

    if (result.error) {
      next(ApiError.badRequest('Ошибка валидации HTTP-запроса', result.error.details));
    } else if (req.params.id) {
      req.params.id = result.value.id;
    } else if (Object.keys(req.query).length) {
      req.query = result.value;
    } else {
      req.body = result.value;
    }

    next();
  };
};

module.exports = validate;
