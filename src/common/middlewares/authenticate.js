// @ts-nocheck
/* eslint-disable require-atomic-updates */
const jwt = require('jsonwebtoken');
const ApiError = require('../api-error');
const UserService = require('../../services/user-service');

const userService = new UserService();

const authenticate = () => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      req.token = token;
      const decoded = jwt.verify(token, 'secret');
      req.user = await userService.read(decoded.userId, token);
      next();
    } catch (e) {
      next(ApiError.unauthorized('Пользователь не авторизован'));
    }
    
  };
};

module.exports = authenticate;
