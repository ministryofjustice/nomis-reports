const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const OffenceService = require('../services/OffenceService');

const services = {};
let setUpServices = (config) => {
  services.offences = services.offences || new OffenceService(config);

  setUpServices = () => {};
};

const listOffences = (req, res, next) =>
  services.offences.listOffences(req.query, req.query.page, req.query.size)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveOffence = (req, res, next) =>
  services.offences.getOffence(req.params.offenceId)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listOffences);
router.get('/:offenceId', retrieveOffence);

module.exports = router;
