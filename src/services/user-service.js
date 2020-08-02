/* eslint-disable require-atomic-updates */
// @ts-nocheck
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ApiError = require('../common/api-error');

const UserService = class {
  get model() {
    return User;
  }

  async create(dto) {
    const user = await this.model.query().findOne({
      userId: dto.userId
    });

    if (user) throw ApiError.conflict('Используйте другой id');

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

  async signin(dto) {
    const user = await this.model.query().findOne({
      userId: dto.userId
    });

    if (!user) throw ApiError.badRequest('Неверный ввод id');

    const comparison = await bcrypt
      .compare(dto.password, user.password)
      .catch(() => { throw ApiError.internal(); });

    if (!comparison) throw ApiError.unauthorized('Неверный ввод пароля');

    const token = jwt.sign({
      userId: dto.userId,
      iat: Math.floor(Date.now() / 1000)
    }, 'secret');
    let tokens = JSON.parse(user.tokens);
    tokens.push(token);
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(user.id, { tokens });
    return token;
  }

  async read(userId, userToken) {
    const user = await this.model.query().findOne({ userId });

    if (!user) throw ApiError.badRequest('Пользователь не найден');

    const token = JSON
      .parse(user.tokens)
      .find(token => token === userToken);

    if (!token) throw ApiError.unauthorized('Пользователь не авторизован');

    return user;
  }

  async logout(userId, userToken) {
    const user = await this.model.query().findOne({ userId });
    let tokens = JSON
      .parse(user.tokens)
      .filter(token => token !== userToken);
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(user.id, { tokens });
  }
};

module.exports = UserService;
