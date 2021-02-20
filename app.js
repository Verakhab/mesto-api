require('dotenv').config();
const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { celebrate, errors, Joi } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3000, URL = 'mongodb://localhost:27017/mestodb' } = process.env;

const app = express();

app.use(cors());

app.set('trust proxy');

mongoose.connect(URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const { connection } = mongoose;

connection.on('open', () => {
  // eslint-disable-next-line no-console
  console.info('Succesfully connected to MongoDB Database');
});

connection.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error(`Database Connection Error: ${err.message}`);
  process.exitCode = 1;
});

app.use(helmet());

app.use(bodyParser.json());
app.use(cookieParser());
app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    // eslint-disable-next-line no-useless-escape
    avatar: Joi.string().regex(/^(http(s)?:\/\/)(w{3}\.)?((\d+\.\d+\.\d+\.\d+)|(([A-Za-z\.-]{2,})\.([A-Za-z]{2,6})))((:\d{2,5})?\/?([\dA-Za-z\/]+#?))?/).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);

app.use('/', usersRouter);
app.use('/', cardsRouter);
app.use('*', (req, res, next) => {
  try {
    throw new NotFoundError('Запрашиваемый ресурс не найден');
  } catch (err) {
    next(err);
  }
});

app.use(errorLogger);

app.use(errors());

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res
      .status(400)
      .send({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res
      .status(400)
      .send({ message: 'Передан некорректный Id' });
  }
  if (err.name === 'DocumentNotFoundError') {
    return res
      .status(404)
      .send({ message: 'Запрашиваемые данные не найдены' });
  }
  if (err.statusCode === undefined) {
    const {
      statusCode = '500',
      message = { message: 'Ошибка сервера' },
    } = err;
    return res
      .status(statusCode)
      .send(message);
  }
  return res
    .status(err.statusCode)
    .send({ message: err.message });
});

app.listen(PORT || 3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000');
});

