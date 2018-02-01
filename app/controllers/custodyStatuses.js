const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const links = require('../helpers/links');
const CustodyStatusService = require('../services/CustodyStatusService');

const map = (fn) => (x) =>
  x && (Array.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);

const services = {};
const setUpServices = (config) => {
  services.custodyStatus = services.custodyStatus || new CustodyStatusService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map(addOffenderLinks('offenderNo')));

const createCustodyStatusListViewModel = (custodyStatuses) =>
  ({
    columns: [
      'offenderNo',
      'custodyStatusCode',
      'custodyStatusDescription',
    ],
    links: {
      offenderNo: 'offender'
    },
    custodyStatuses,
    recordCount: custodyStatuses.length,
  });

  const createCustodyStatusViewModel = (custodyStatus) => ({ custodyStatus });

  const renderCustodyStatusList = (res, transform) => helpers.format(res, 'custodyStatuses/list', transform);
  const renderCustodyStatus = (res, transform) => helpers.format(res, 'custodyStatuses/detail', transform);

const listCustodyStatuses = (req, res, next) =>
  proxy(services.custodyStatus, 'list', req.query)
    .then(renderCustodyStatusList(res, createCustodyStatusListViewModel))
    .catch(helpers.failWithError(res, next));

const allCustodyStatuses = (req, res, next) =>
  proxy(services.custodyStatus, 'all', req.query)
    .then(renderCustodyStatusList(res, createCustodyStatusListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveCustodyStatus = (req, res, next) =>
  proxy(services.custodyStatus, 'getStatus', req.params.nomsId, req.query)
    .then(renderCustodyStatus(res, createCustodyStatusViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listCustodyStatuses);
router.get('/all', allCustodyStatuses);
router.get('/:nomsId', retrieveCustodyStatus);

module.exports = router;
