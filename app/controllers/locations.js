const express = require('express');
const router = new express.Router();

const util = require('util');
const helpers = require('../helpers');
const links = require('../helpers/links');
const LocationService = require('../services/LocationService');

const map = (fn) => (x) =>
  x && (util.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) =>
  ((x.links = x.links || {})[k] = fn(x[p])) && x;

const addPrisonLiveRoll = (p) => expandLink(p, 'liveRoll', links.prisonLiveRoll);
const addAgencyLinks = (p) => expandLink(p, 'agency', links.agency);
const addLocationInmates = (p) => expandLink(p, 'inmates', links.locationInmates);

const services = {};
const setUpServices = (config) => {
  services.location = services.location || new LocationService(config);
};

const proxy = (service, fn, ...params) =>
  service[fn].apply(service, params)
    .then(map(addAgencyLinks('agencyId')))
    .then(map(addPrisonLiveRoll('agencyId')))
    .then(map(addLocationInmates('locationId')));

const createLocationsViewModel = (locations) =>
  ({
    columns: [
      'locationId',
      'description',
      'locationType',
      'agencyId',
      'currentOccupancy',
      'locationPrefix',
      'userDescription',
    ],
    links: {
      locationId: 'liveRoll',
      currentOccupancy: 'inmates',
    },
    locations: locations,
    recordCount: locations[0].recordCount,
  });

const renderLocationsList = (res, transform) => helpers.format(res, 'location/list', transform);

const listLocations = (req, res, next) =>
  proxy(services.location, 'list', req.query.search)
    .then(renderLocationsList(res, createLocationsViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveLocation = (req, res, next) =>
  proxy(services.location, 'getDetails', req.params.locationId)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveInmates = (req, res, next) =>
  proxy(services.location, 'listImates', req.params.locationId, req.query.search)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listLocations);
router.get('/:locationId', retrieveLocation);
router.get('/:locationId/inmates', retrieveInmates);

module.exports = router;
