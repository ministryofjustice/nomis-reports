const express = require('express');
const router = express.Router();

const helpers = require('../helpers');
const eliteApiAgent = require('../helpers/eliteApiAgent');
const custodyStatusService = require('../services/custodyStatus');
const usersService = require('../services/users');

const renderCustodyStatusList = (res) => helpers.format(res, 'custodyStatus/list');

const getCustodyStatusList = (config) =>
  config.custodyStatusService.listCustodyStatuses();

const createCustodyStatusListViewModel = () => (custodyStatuses) =>
  ({
    custodyStatuses: custodyStatuses,
    total_custodyStatuses: custodyStatuses.length,
  });

const listCustodyStatuses = (req, res, next) =>
  getCustodyStatusList(req.app.locals)
    .then(createCustodyStatusListViewModel(req))
    .then(renderCustodyStatusList(res))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, config);

  req.app.locals.custodyStatusService = req.app.locals.custodyStatusService || custodyStatusService(agent, config.apiUrl);
  req.app.locals.usersService = req.app.locals.usersService || usersService(agent, config.apiUrl);

  next();
});
router.get('/', listCustodyStatuses);

module.exports = router;
