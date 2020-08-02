const httpStatus = require('http-status');

const ApiError = class {
  constructor(message, statusCode, data) {
    this.statusCode = statusCode;
    this.error = httpStatus[statusCode];
    this.message = message || this.error;
    this.data = data;
  }

  static unauthorized(message) {
    return new ApiError(message || null, 401);
  }

  static forbidden() {
    return new ApiError(null, 403);
  }

  static badRequest(message, data) {
    return new ApiError(message, 400, data);
  }

  static paymentFailed(message) {
    return new ApiError(message, 402);
  }

  static notFound(message) {
    return new ApiError(message, 404);
  }

  static conflict(message) {
    return new ApiError(message, 409);
  }

  static unsupportedMediaType(message) {
    return new ApiError(message, 415);
  }

  static internal() {
    return new ApiError(null, 500);
  }
};

module.exports = ApiError;
