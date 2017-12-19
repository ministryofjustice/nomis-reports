const express = require('express');
const router = express.Router();

const helpers = require('../helpers');
const offendersService = require('../services/offenders');
const nomisApiAgent = require('../helpers/nomisApiAgent');

const getDetails = (req) =>
  req.app.locals.offendersService.getDetails({ noms_id: req.params.noms_id });
const getLocation = (req) =>
  req.app.locals.offendersService.getLocation({ noms_id: req.params.noms_id });
const getImage = (req) =>
  req.app.locals.offendersService.getImage({ noms_id: req.params.noms_id });
const getCharges = (req) =>
  req.app.locals.offendersService.getCharges({ noms_id: req.params.noms_id });
const getPssDetail = (req) =>
  req.app.locals.offendersService.getPssDetail({ noms_id: req.params.noms_id });

const retrieveDetails = (req, res, next) =>
  getDetails(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveLocation = (req, res, next) =>
  getLocation(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveImage = (req, res, next) =>
  getImage(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveCharges = (req, res, next) =>
  getCharges(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrievePssDetail = (req, res, next) =>
  getPssDetail(req)
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.nomis;
  let agent = nomisApiAgent(undefined, undefined, config);

  req.app.locals.offendersService = req.app.locals.offendersService || offendersService(agent, config.apiUrl);

  next();
});

router.get('/:noms_id', retrieveDetails);
router.get('/:noms_id/location', retrieveLocation);
router.get('/:noms_id/image', retrieveImage);
router.get('/:noms_id/charges', retrieveCharges);
router.get('/:noms_id/pss_detail', retrievePssDetail);

module.exports = router;
