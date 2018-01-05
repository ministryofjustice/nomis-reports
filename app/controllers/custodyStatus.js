const express = require('express');
const router = new express.Router();

const util = require('util');
const helpers = require('../helpers');
const links = require('../helpers/links');
const CustodyStatusService = require('../services/CustodyStatusService');

const map = (fn) => (x) =>
  x && (util.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) =>
  ((x.links = x.links || {})[k] = fn(x[p])) && x;

const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);

const services = {};
const setUpServices = (config) => {
  services.custodyStatus = services.custodyStatus || new CustodyStatusService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map(addOffenderLinks('offenderNo')));

const createCustodyStatusViewModel = (custodyStatuses) =>
  ({
    columns: [
      'offenderNo',
      'custodyStatusCode',
      'custodyStatusDescription'
    ],
    links: {
      offenderNo: 'offender'
    },
    custodyStatuses: custodyStatuses,
    recordCount: custodyStatuses.length,
  });

const renderCustodyStatusList = (res, transform) => helpers.format(res, 'custodyStatus/list', transform);

const listCustodyStatuses = (req, res, next) =>
  proxy(services.custodyStatus, 'list', req.query.search)
    .then(renderCustodyStatusList(res, createCustodyStatusViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveCustodyStatus = (req, res, next) =>
  proxy(services.custodyStatus, 'getDetails', req.params.nomsId)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listCustodyStatuses);
router.get('/:nomsId', retrieveCustodyStatus);

module.exports = router;
