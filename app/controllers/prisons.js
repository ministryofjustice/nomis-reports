const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const links = require('../helpers/links');
const PrisonService = require('../services/PrisonService');

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
  services.prison = services.prison || new PrisonService(config);
};

const proxy = (service, fn, ...params) =>
  service[fn].apply(service, params)
    .then(map(addOffenderLinks('offenderNo')));

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
