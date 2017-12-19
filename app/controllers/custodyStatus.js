const express = require('express');
const router = express.Router();

const util = require('util');
const helpers = require('../helpers');
const links = require('../helpers/links');
const eliteApiAgent = require('../helpers/eliteApiAgent');
const custodyStatusService = require('../services/custodyStatus');

const map = (fn) => (x) => x && (util.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => ((x.links = x.links || {})[k] = fn(x[p])) && x;

const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);

const list = (req) =>
  req.app.locals.custodyStatusService
    .list({ custodyStatusCodes: req.query.codes, onDate: req.query.date });

const getCustodyStatus = (req) =>
  req.app.locals.custodyStatusService
    .getCustodyStatus({ noms_id: req.params.noms_id }, { custodyStatusCodes: req.query.codes, onDate: req.query.date });

const proxy = (fn, req) =>
  fn(req)
    .then((response) => response.body)
    .then(map(addOffenderLinks('offenderNo')));

const createCustodyStatusListViewModel = (custodyStatuses) =>
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
  proxy(list, req)
    .then(renderCustodyStatusList(res, createCustodyStatusListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveCustodyStatus = (req, res, next) =>
  proxy(getCustodyStatus, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, undefined, config);

  req.app.locals.custodyStatusService = req.app.locals.custodyStatusService || custodyStatusService(agent, config.apiUrl);

  next();
});
router.get('/', listCustodyStatuses);
router.get('/:noms_id', retrieveCustodyStatus);

module.exports = router;
