// @ts-nocheck
const express = require('express');
const fileController = require('./file-controller');
const userController = require('./user-controller');

const router = express.Router();

router.use('/file', fileController);
router.use('/', userController);

module.exports = router;
