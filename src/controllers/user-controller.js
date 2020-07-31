const express = require('express');
const UserService = require('../services/user-service');

const router = express.Router();
const userService = new UserService();

module.exports = router;
