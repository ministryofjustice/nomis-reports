const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const links = require('../helpers/links');
const OffenderService = require('../services/OffenderService');

const map = (fn) => (x) =>
  x && (Array.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addCustodyStatusLinks = (p) => expandLink(p, 'custodyStatus', links.custodyStatus);

const services = {};
const setUpServices = (config) => {
  services.offender = services.offender || new OffenderService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map(addCustodyStatusLinks('offenderNo')));

const createOffenderViewModel = (offender) => ({ offender });


const renderer = (view) => (res, transform) => helpers.format(res, `offenders/${view}`, transform);
const renderOffender = renderer('detail');
/*
const renderOffenderLocation = renderer('location');
*/

const retrieveOffenderDetails = (req, res, next) =>
  proxy(services.offender, 'getDetails', req.params.nomsId)
    .then(renderOffender(res, createOffenderViewModel))
    .catch(helpers.failWithError(res, next));

/*
const retrieveOffenderLocation = (req, res, next) =>
  proxy(services.offender, 'getLocation', req.params.nomsId)
    .then(renderOffenderLocation(res, createOffenderLocationViewModel))
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
*/

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/:nomsId', retrieveOffenderDetails);
/*
router.get('/:noms_id/location', retrieveOffenderLocation);
router.get('/:noms_id/image', retrieveOffenderImage);
router.get('/:noms_id/charges', retrieveOffenderCharges);
router.get('/:noms_id/pss_detail', retrieveOffenderPssDetail);
*/

module.exports = router;
