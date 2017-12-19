const express = require('express');
const router = express.Router();

const helpers = require('../helpers');
const eliteApiAgent = require('../helpers/eliteApiAgent');
const locationsService = require('../services/locations');

const list = (req) =>
  req.app.locals.locationsService
    .list({ query: req.query.search })
    .set('Page-Limit', 1000);

const getDetails = (req) =>
  req.app.locals.locationsService.getDetails({ location_id: req.params.location_id });

const listImates = (req) =>
  req.app.locals.locationsService
    .listImates({ location_id: req.params.location_id }, { query: req.query.search })
    .set('Page-Limit', 1000);

const listLocations = (req, res, next) =>
  list(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveLocation = (req, res, next) =>
  getDetails(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const listInmates = (req, res, next) =>
  listImates(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, undefined, config);

  req.app.locals.locationsService = req.app.locals.locationsService || locationsService(agent, config.apiUrl);

  next();
});
router.get('/', listLocations);
router.get('/:location_id', retrieveLocation);
router.get('/:location_id/inmates', listInmates);

module.exports = router;
