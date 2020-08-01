// @ts-nocheck
const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const joi = require('@hapi/joi');
const FileService = require('../services/file-service');
const validate = require('../common/middlewares/validate');
const makeDto = require('../common/middlewares/make-dto');

const router = express.Router();
const fileService = new FileService();
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.resolve('uploads'));
  },
  filename(req, file, cb) {
    file.uploadedAt = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
    ).toJSON().slice(0, -1);
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

router.post('/upload',
  upload.single('upload'),
  makeDto(),
  async (req, res, next) => {
    try {
      const file = await fileService.create(req.dto);
      res.status(201).json(file);
    } catch (e) {
      next(e);
    }
  });

router.get('/list',
  validate(joi.object({
    listSize: joi.number().integer().greater(-1),
    page: joi.number().integer().positive()
  })),
  async (req, res, next) => {
    try {
      const files = await fileService.getAll(req.query);
      res.json(files);
    } catch (e) {
      next(e);
    }
  });

router.get('/:id',
  validate(joi.object({
    id: joi.number().integer().positive()
  })),
  async (req, res, next) => {
    try {
      const file = await fileService.getById(req.params.id);
      res.json(file);
    } catch (e) {
      next(e);
    }
  });

router.put('/update/:id',
  validate(joi.object({
    id: joi.number().integer().positive()
  })),
  upload.single('update'),
  makeDto(),
  async (req, res, next) => {
    try {
      const oldFile = await fileService.getById(req.params.id);
      const newFile = await fileService.update(req.params.id, req.dto);
      fs.unlinkSync(path.resolve('uploads') + '/' + oldFile.name);
      res.json(newFile);
    } catch (e) {
      next(e);
    }
  });

router.delete('/delete/:id',
  validate(joi.object({
    id: joi.number().integer().positive()
  })),
  async (req, res, next) => {
    try {
      const file = await fileService.getById(req.params.id);
      await fileService.delete(req.params.id);
      fs.unlinkSync(path.resolve('uploads') + '/' + file.name);
      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  });

router.get('/download/:id',
  validate(joi.object({
    id: joi.number().integer().positive()
  })),
  async (req, res, next) => {
    try {
      const file = await fileService.getById(req.params.id);
      res.download(path.resolve('uploads') + '/' + file.name);
    } catch (e) {
      next(e);
    }
  });

module.exports = router;
