const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const CustodyStatusService = require('../services/CustodyStatusService');

const services = {};
let setUpServices = (config) => {
  services.custodyStatus = services.custodyStatus || new CustodyStatusService(config);

  setUpServices = () => {};
};

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
  services.custodyStatus.list(req.query)
    .then(renderCustodyStatusList(res, createCustodyStatusListViewModel))
    .catch(helpers.failWithError(res, next));

const allCustodyStatuses = (req, res, next) =>
  services.custodyStatus.all(req.query)
    .then(renderCustodyStatusList(res, createCustodyStatusListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveCustodyStatus = (req, res, next) =>
  services.custodyStatus.getStatus(req.params.nomsId, req.query)
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
