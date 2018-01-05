const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const eliteApiAgent = require('../helpers/eliteApiAgent');
const usersService = require('../repositories/users');

const authorizeUser = (req, config) =>
  req.app.locals.usersService
    .postLogin({
      username: config.user,
      password: config.password
    })
    .then((response) =>  req.app.locals.config.elite2.elite2Jwt = response.body);

const userLogin = (req, res, next) =>
  authorizeUser(req, req.app.locals.config.reports)
    .then(helpers.redirect(res, '/'))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, undefined, config);

  req.app.locals.usersService = req.app.locals.usersService || usersService(agent, config.apiUrl);

  next();
});
router.get('/login', userLogin);

module.exports = router;
