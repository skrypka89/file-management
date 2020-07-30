/* eslint-disable require-atomic-updates */
// @ts-nocheck
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ApiError = require('../common/api-error');

class UserService {
  get model() {
    return User;
  }

  async create(dto) {
    const foundUser = await this.model.query().findOne({
      userId: dto.userId
    });

    if (foundUser) throw ApiError.conflict('Используйте другой id');

    dto.password = await bcrypt
      .hash(dto.password, 10)
      .catch(() => { throw ApiError.internal(); });
    const token = jwt.sign({
      userId: dto.userId,
      iat: Math.floor(Date.now() / 1000)
    }, 'secret');
    const tokens = [];
    tokens.push(token);
    dto.tokens = JSON.stringify(tokens);
    await this.model.query().insert(dto);
    return token;
  }

  async signin(userId, password) {
    const foundUser = await this.model.query().findOne({ userId });

    if (!foundUser) throw ApiError.badRequest('Неверный ввод id');

    const comparison = await bcrypt
      .compare(password, foundUser.password)
      .catch(() => { throw ApiError.internal(); });

    if (!comparison) throw ApiError.unauthorized('Неверный ввод пароля');

    const token = jwt.sign({
      id: foundUser.id,
      iat: Math.floor(Date.now() / 1000)
    }, 'secret');
    let tokens = JSON.parse(foundUser.tokens);
    tokens.push(token);
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(foundUser.id, { tokens });
    return token;
  }
}

module.exports = UserService;
