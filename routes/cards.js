const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards, createCard, deleteCard, setLike, remLike,
} = require('../controllers/cards');

cardsRouter.get('/cards', getCards);

cardsRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    // eslint-disable-next-line no-useless-escape
    link: Joi.string().regex(/^(http(s)?:\/\/)(w{3}\.)?((\d+\.\d+\.\d+\.\d+)|(([A-Za-z\.-]{2,})\.([A-Za-z]{2,6})))((:\d{2,5})?\/?([\dA-Za-z\/]+#?))?/).required(),
  }),
}), createCard);

cardsRouter.delete('/cards/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), deleteCard);

cardsRouter.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), setLike);

cardsRouter.delete('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24),
  }),
}), remLike);

module.exports = cardsRouter;
