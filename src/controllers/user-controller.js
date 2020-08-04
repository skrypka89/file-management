// @ts-nocheck
const express = require('express');
const joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const UserService = require('../services/user-service');
const validate = require('../common/middlewares/validate');
const regex = require('../common/regex');
const authenticate = require('../common/middlewares/authenticate');
const ApiError = require('../common/api-error');

const router = express.Router();
const userService = new UserService();

router.post('/signup',
  validate(joi.object({
    userId: joi.string().regex(regex).required(),
    password: joi.string().min(8).required()
  })),
  async (req, res, next) => {
    try {
      const tokensObject = await userService.create(req.body);
      res.status(201).json(tokensObject);
    } catch (e) {
      next(e);
    }
  }
);

router.post('/signin',
  validate(joi.object({
    userId: joi.string().regex(regex).required(),
    password: joi.string().required()
  })),
  async (req, res, next) => {
    try {
      const tokensObject = await userService.signin(req.body);
      res.json(tokensObject);
    } catch (e) {
      next(e);
    }
  }
);

router.post('/signin/new_token',
  validate(joi.object({
    refreshToken: joi.string().required()
  })),
  async (req, res, next) => {
    const refreshToken = req.body.refreshToken;

    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

      if (payload.type !== 'refresh') {
        next(ApiError.badRequest('Неверный тип токена'));
      }

      const tokensObject = await userService
        .updateTokensObject(payload.userId, refreshToken);
      res.json(tokensObject);
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        const decoded = jwt.decode(refreshToken);
        await userService.deleteTokensObject(decoded, refreshToken);
        next(ApiError.badRequest('Время действия токена истекло'));
      } else if (e instanceof jwt.JsonWebTokenError) {
        next(ApiError.badRequest('Неверный токен'));
      } else {
        next(e);
      }
    }
  }
);

router.get('/info',
  authenticate(),
  (req, res, next) => {
    try {
      res.json({ userId: req.user.userId });
    } catch (e) {
      next(e);
    }
  }
);

router.get('/logout',
  authenticate(),
  async (req, res, next) => {
    try {
      await userService.logout(req.user.userId, req.token);
      res.json();
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
