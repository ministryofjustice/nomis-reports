const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const UserService = require('../services/UserService');

const services = {};
let setUpServices = (config) => {
  services.user = services.user || new UserService(config);

  setUpServices = () => {};
};

const userLogin = (req, res, next) => {
  let username = req.body && req.body.user || req.app.locals.config.reports.user;
  let password = req.body && req.body.password || req.app.locals.config.reports.password;

  return services.user.login(username, password)
    .then(helpers.redirect(res, '/'))
    .catch(helpers.failWithError(res, next));
};

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});
router.get('/login', userLogin);
router.post('/login', userLogin);

module.exports = router;
