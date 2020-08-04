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
    const tokensObject = {
      bearerToken: jwt.sign({
        type: 'bearer',
        userId: dto.userId
      }, process.env.JWT_SECRET, { expiresIn: '10m' }),
      refreshToken: jwt.sign({
        type: 'refresh',
        userId: dto.userId
      }, process.env.JWT_SECRET, { expiresIn: '1d' })
    }; 
    const tokens = [];
    tokens.push(tokensObject);
    dto.tokens = JSON.stringify(tokens);
    await this.model.query().insert(dto);
    return tokensObject;
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

    const tokensObject = {
      bearerToken: jwt.sign({
        type: 'bearer',
        userId: dto.userId
      }, process.env.JWT_SECRET, { expiresIn: '10m' }),
      refreshToken: jwt.sign({
        type: 'refresh',
        userId: dto.userId
      }, process.env.JWT_SECRET, { expiresIn: '1d' })
    };
    let tokens = JSON.parse(user.tokens);
    tokens.push(tokensObject);
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(user.id, { tokens });
    return tokensObject;
  }

  async read(userId, bearerToken) {
    const user = await this.model.query().findOne({ userId });

    if (!user) throw ApiError.unauthorized('Пользователь не найден');

    const tokensObject = JSON
      .parse(user.tokens)
      .find(tokensObject => tokensObject.bearerToken === bearerToken);

    if (!tokensObject) {
      throw ApiError.unauthorized('Пользователь не авторизован');
    }

    return user;
  }

  async updateTokensObject(userId, refreshToken) {
    const user = await this.model.query().findOne({ userId });

    if (!user) throw ApiError.badRequest('Пользователь не найден');

    let tokens = JSON.parse(user.tokens);
    const index = tokens
      .findIndex(tokensObject =>
        tokensObject.refreshToken === refreshToken
      );

    if (!(~index)) {
      throw ApiError.unauthorized('Пользователь не авторизован');
    }

    const tokensObject = {
      bearerToken: jwt.sign({
        type: 'bearer',
        userId
      }, process.env.JWT_SECRET, { expiresIn: '10m' }),
      refreshToken
    };
    tokens[index] = tokensObject;
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(user.id, { tokens });
    return tokensObject;
  }

  async logout(userId, bearerToken) {
    const user = await this.model.query().findOne({ userId });
    let tokens = JSON
      .parse(user.tokens)
      .filter(tokensObject =>
        tokensObject.bearerToken !== bearerToken
      );
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(user.id, { tokens });
  }

  async deleteTokensObject(payload, refreshToken) {
    if (payload.type !== 'refresh') return;

    if (!payload.userId) return;

    const user = await this.model.query().findOne({
      userId: payload.userId
    });

    if (!user) return;

    let tokens = JSON
      .parse(user.tokens)
      .filter(tokensObject =>
        tokensObject.refreshToken !== refreshToken
      );
    tokens = JSON.stringify(tokens);
    await this.model.query().patchAndFetchById(user.id, { tokens });
  }
};

module.exports = UserService;
