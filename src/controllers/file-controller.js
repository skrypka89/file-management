const express = require('express');
const FileService = require('../services/file-service');

const router = express.Router();
const fileService = new FileService();

module.exports = router;
