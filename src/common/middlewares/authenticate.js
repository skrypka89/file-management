// @ts-nocheck
/* eslint-disable require-atomic-updates */
const jwt = require('jsonwebtoken');
const ApiError = require('../api-error');
const UserService = require('../../services/user-service');

const userService = new UserService();

const authenticate = () => {
  return async (req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) next(ApiError.unauthorized('Токен не найден'));

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (payload.type !== 'bearer') next(ApiError.unauthorized('Неверный тип токена'));

      req.user = await userService.read(payload.userId, token);
      req.token = token;
      next();
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        next(ApiError.unauthorized('Время действия токена истекло'));
      } else if (e instanceof jwt.JsonWebTokenError) {
        next(ApiError.unauthorized('Пользователь не авторизован'));
      } else {
        next(e);
      }
    }
  };
};

module.exports = authenticate;
