const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const links = require('../helpers/links');
const AgencyService = require('../services/AgencyService');

const map = (fn) => (x) =>
  x && (Array.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addAgencyLinks = (p) => expandLink(p, 'agency', links.agency);
const addPrisonLiveRoll = (p) => expandLink(p, 'liveRoll', links.prisonLiveRoll);

const services = {};
const setUpServices = (config) => {
  services.agency = services.agency || new AgencyService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map(addAgencyLinks('agencyId')))
    .then(map(addPrisonLiveRoll('agencyId')));

const createAgenciesViewModel = (agencies) =>
  ({
    columns: [
      'agencyId',
      'description',
      'agencyType',
    ],
    links: {
      agencyId: 'agency',
    //agencyId: 'liveRoll',
    },
    agencies,
    recordCount: agencies && agencies[0] && agencies[0].recordCount || 0,
  });

const createAgencyViewModel = (agency) => ({ agency });

const renderAgencyList = (res, transform) => helpers.format(res, 'agencies/list', transform);
const renderAgency = (res, transform) => helpers.format(res, 'agencies/detail', transform);

const listAgencies = (req, res, next) =>
  proxy(services.agency, 'list', req.query.search)
    .then(renderAgencyList(res, createAgenciesViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveAgency = (req, res, next) =>
  proxy(services.agency, 'getDetails', req.params.agencyId)
    .then(renderAgency(res, createAgencyViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listAgencies);
router.get('/:agencyId', retrieveAgency);

module.exports = router;
