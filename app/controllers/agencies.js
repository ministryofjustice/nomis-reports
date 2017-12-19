const express = require('express');
const router = express.Router();

const helpers = require('../helpers');
const eliteApiAgent = require('../helpers/eliteApiAgent');
const agenciesService = require('../services/agencies');

const list = (req) =>
  req.app.locals.agenciesService
    .list({ query: req.query.search })
    .set('Page-Limit', 1000);

const getDetails = (req) =>
  req.app.locals.agenciesService.getDetails({ agency_id: req.params.agency_id });

const listAgencies = (req, res, next) =>
  list(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveAgency = (req, res, next) =>
  getDetails(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, undefined, config);

  req.app.locals.agenciesService = req.app.locals.agenciesService || agenciesService(agent, config.apiUrl);

  next();
});
router.get('/', listAgencies);
router.get('/:agency_id', retrieveAgency);

module.exports = router;
