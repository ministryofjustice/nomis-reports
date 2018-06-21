const express = require('express');
const router = new express.Router();

//const moment = require('moment');
const helpers = require('../helpers');

const ReportsService = require('../services/ReportsService');

const services = {};
let setUpServices = (config) => {
  services.reports = services.reports || new ReportsService(config);

  setUpServices = () => {};
};

const list = (req, res, next) =>
  services.reports.listMovements(
      Object.assign({}, req.query, { page: undefined, size: undefined }),
      req.query.page,
      req.query.size
    )
    .then(data => {
      res.links(helpers.processLinks(data._links));
      return res.json(data._embedded.externalMovementList);
    })
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', list);

module.exports = router;
