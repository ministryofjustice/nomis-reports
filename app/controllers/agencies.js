const express = require('express');
const router = new express.Router();

const util = require('util');
const helpers = require('../helpers');
const links = require('../helpers/links');
const AgencyService = require('../services/AgencyService');

const map = (fn) => (x) =>
  x && (util.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) =>
  ((x.links = x.links || {})[k] = fn(x[p])) && x;

const addPrisonLiveRoll = (p) => expandLink(p, 'liveRoll', links.prisonLiveRoll);

const services = {};
const setUpServices = (config) => {
  services.agency = services.agency || new AgencyService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map(addPrisonLiveRoll('agencyId')));

const createAgencyViewModel = (agencies) =>
  ({
    columns: [
      'agencyId',
      'description',
      'agencyType',
    ],
    links: {
      agencyId: 'liveRoll',
    },
    agencies: agencies,
    recordCount: agencies[0].recordCount,
  });

const renderAgencyList = (res, transform) => helpers.format(res, 'agency/list', transform);

const listAgencies = (req, res, next) =>
  proxy(services.agency, 'list', req.query.search)
    .then(renderAgencyList(res, createAgencyViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveAgency = (req, res, next) =>
  proxy(services.agency, 'getDetails', req.params.agencyId)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listAgencies);
router.get('/:agencyId', retrieveAgency);

module.exports = router;
