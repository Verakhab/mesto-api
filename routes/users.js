const usersRouter = require('express').Router();
const usersAll = require('../data/users');

usersRouter.get('/users', (req, res) => {

  res.send(usersAll);
});

usersRouter.get('/users/:id', (req, res) => {

  usersAll.find((item) => {
    
      item._id === id
      return res.status(200).send(item);
  });
  
  return res.status(404).send({ "message": "Нет пользователя с таким id" });
});

module.exports = usersRouter;
