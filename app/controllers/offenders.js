const express = require('express');
const router = new express.Router();

const moment = require('moment');
const helpers = require('../helpers');

const ReportsService = require('../services/ReportsService');

const AOModel = require('../models/AO');
const CDEModel = require('../models/CDE');

const services = {};
let setUpServices = (config) => {
  services.reports = services.reports || new ReportsService(config);

  setUpServices = () => {};
};

const list = (req, res, next) =>
  services.reports.listOffenders({} /* query */, req.query.page, req.query.size)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveDetails = (req, res, next) =>
  services.reports
    .getDetails(req.params.offenderId)
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveAODetails = (req, res, next) =>
  services.reports
    .getDetails(req.params.offenderId)
    .then(AOModel.build(moment()))
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveCDEDetails = (req, res, next) =>
  services.reports
    .getDetails(req.params.offenderId)
    .then(CDEModel.build(moment()))
    .then(data => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', list);
router.get('/:offenderId/', retrieveDetails);
router.get('/:offenderId/ao', retrieveAODetails);
router.get('/:offenderId/cde', retrieveCDEDetails);

module.exports = router;
