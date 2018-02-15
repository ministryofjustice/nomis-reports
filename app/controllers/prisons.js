const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const PrisonService = require('../services/PrisonService');

const services = {};
let setUpServices = (config) => {
  services.prison = services.prison || new PrisonService(config);

  setUpServices = () => {};
};

const proxy = (service, fn, ...params) =>
  service[fn].apply(service, params);

const createLiveRollViewModel = (liveRoll) =>
  ({
    columns: [
      'offenderNo',
    ],
    links: {
      offenderNo: 'offender',
    },
    liveRoll,
    recordCount: liveRoll.length || 0,
  });

const renderLiveRollList = (res, transform) => helpers.format(res, 'prisons/liveRoll', transform);

const retrieveLiveRoll = (req, res, next) =>
  proxy(services.prison, 'liveRoll', req.params.prisonId, req.query.search)
    .then(renderLiveRollList(res, createLiveRollViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/:prison_id/live_roll', retrieveLiveRoll);

module.exports = router;
