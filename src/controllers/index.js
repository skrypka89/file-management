// @ts-nocheck
const express = require('express');
const fileController = require('./file-controller');
const userController = require('./user-controller');
const authenticate = require('../common/middlewares/authenticate');

const router = express.Router();

router.use('/file', authenticate(), fileController);
router.use('/', userController);

module.exports = router;
