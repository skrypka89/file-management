// @ts-nocheck
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { ValidationError, NotFoundError } = require('objection');
const cors = require('cors');
const db = require('./common/db');
const ApiError = require('./common/api-error');
const router = require('./controllers');

dotenv.config({ path: path.resolve('config/.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan(':remote-addr - :method :url :status :response-time ms'));
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.use('/', router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(ApiError.notFound('API not found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    if (err instanceof ValidationError) {
      err = ApiError.badRequest(err.message || 'Ошибка Валидации', err.data);
    } else if (err instanceof NotFoundError) {
      err = ApiError.notFound('Данные не найдены');
    } else {
      console.error(err);
      err = ApiError.internal();
    }
  }

  res.status(err.statusCode).send(err);
});

app.listen(port, async () => {
  try {
    await db.raw('select 1');
    console.log(`Server started on port ${port}`);
  } catch (e) {
    console.error(e);
  }
});
