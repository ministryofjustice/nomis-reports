const express = require('express');
const router = express.Router();

const helpers = require('../helpers');
const usersService = require('../services/users');
const eliteApiAgent = require('../helpers/eliteApiAgent');

const getUserLogin = (req) =>
  req.app.locals.usersService.login({ username: 'MSMITH', password: 'password123456' });

const userLogin = (req, res, next) =>
  getUserLogin(req)
    .then((response) => res.json(response))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, config);

  req.app.locals.usersService = req.app.locals.usersService || usersService(agent, config.apiUrl);

  next();
});

router.get('/', userLogin);

module.exports = router;
