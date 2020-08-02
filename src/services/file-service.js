// @ts-nocheck
const File = require('../models/file');
const ApiError = require('../common/api-error');

const FileService = class {
  get model() {
    return File;
  }

  async create(dto) {
    const file = await this.model.query().findOne({
      name: dto.name,
      size: dto.size
    });

    if (file) throw ApiError.conflict('Данный файл уже загружен');

    return this.model.query().insertAndFetch(dto);
  }

  async getAll({ listSize = 10, page = 1 }) {
    return this.model.query().limit(listSize).offset(listSize * (page - 1));
  }

  async getById(id) {
    const file = await this.model.query().findById(id);

    if (!file) throw ApiError.notFound('Файл не найден');

    return file;
  }

  async update(id, dto) {
    const found = await this.model.query().findOne({
      name: dto.name,
      size: dto.size
    });

    if (found) throw ApiError.conflict('Нельзя обновить файл');

    return this.model.query().patchAndFetchById(id, dto);
  }

  async delete(id) {
    return this.model.query().deleteById(id);
  }
};

module.exports = FileService;
