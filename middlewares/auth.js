const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/unauthorized-err');

const { JWT_SECRET } = process.env;

module.exports = async (req, res, next) => {
  const authorization = req.cookies.jwt;
  if (!authorization) {
    throw new Unauthorized('Требуется авторизация');
  }
  let payload;
  try {
    payload = await jwt.verify(authorization, JWT_SECRET || 'some-secret-key');
  } catch (err) {
    next(err);
  }
  req.user = payload;
  return next();
};
