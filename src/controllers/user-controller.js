// @ts-nocheck
const express = require('express');
const joi = require('@hapi/joi');
const UserService = require('../services/user-service');
const validate = require('../common/middlewares/validate');
const regex = require('../common/regex');
const authenticate = require('../common/middlewares/authenticate');

const router = express.Router();
const userService = new UserService();

router.post('/signup',
  validate(joi.object({
    userId: joi.string().regex(regex).required(),
    password: joi.string().min(8).required()
  })),
  async (req, res, next) => {
    try {
      const token = await userService.create(req.body);
      res.status(201).json({ token });
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
      const token = await userService.signin(req.body);
      res.json({ token });
    } catch (e) {
      next(e);
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
