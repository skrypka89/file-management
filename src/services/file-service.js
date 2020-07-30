const File = require('../models/file');
const ApiError = require('../common/api-error');

class FileService {
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

  async getAll({ page = 1, list_size = 10 }) {
    if (typeof list_size !== 'number') {
      return this.model.query();
    }

    if (typeof page !== 'number') {
      return this.model.query().limit(list_size);
    }

    return this.model.query().limit(list_size).offset(list_size * (page - 1));
  }

  async getById(id) {
    return this.model.query().findById(id);
  }

  async update(id, dto) {
    return this.model.query().patchAndFetchById(id, dto);
  }

  async delete(id) {
    const deleted = await this.model.query().deleteById(id);

    if (!deleted) throw ApiError.notFound('id не найден');
  }
}

module.exports = FileService;
