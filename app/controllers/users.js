const express = require('express');
const router = express.Router();

const helpers = require('../helpers');
const usersService = require('../services/users');
const eliteApiAgent = require('../helpers/eliteApiAgent');

const authorizeUser = (req) =>
  req.app.locals.usersService.postLogin({ username: 'MSMITH', password: 'password123456' });

const userLogin = (req, res, next) =>
  authorizeUser(req)
    .then((response) => {
      req.app.locals.config.elite2.elite2Jwt = response.body;
      return response.body;
    })
    .then((config) => res.json(config))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, undefined, config);

  req.app.locals.usersService = req.app.locals.usersService || usersService(agent, config.apiUrl);

  next();
});

router.get('/login', userLogin);

module.exports = router;
