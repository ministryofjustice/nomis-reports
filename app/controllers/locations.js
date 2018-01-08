const express = require('express');
const router = new express.Router();

const util = require('util');
const helpers = require('../helpers');
const links = require('../helpers/links');
const LocationService = require('../services/LocationService');

const map = (fn) => (x) =>
  x && (util.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addAgencyLinks = (p) => expandLink(p, 'agency', links.agency);
const addPrisonLiveRoll = (p) => expandLink(p, 'liveRoll', links.prisonLiveRoll);
const addLocation = (p) => expandLink(p, 'location', links.location);
const addLocationInmates = (p) => expandLink(p, 'inmates', links.locationInmates);
const addBookingLinks = (p) => expandLink(p, 'booking', links.booking);
const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);
const addAssignedLivingUnitLinks = (p) => expandLink(p, 'assignedLivingUnit', links.location);

const services = {};
const setUpServices = (config) => {
  services.location = services.location || new LocationService(config);
};

const proxy = (service, fn, ...params) =>
  service[fn].apply(service, params)
    .then(map(addAgencyLinks('agencyId')))
    .then(map(addPrisonLiveRoll('agencyId')))
    .then(map(addLocationInmates('locationId')))
    .then(map(addLocation('locationId')))
    .then(map(addBookingLinks('bookingId')))
    .then(map(addOffenderLinks('offenderNo')))
    .then(map(addAssignedLivingUnitLinks('assignedLivingUnitId')));

const createLocationsViewModel = (locations) =>
  ({
    columns: [
      'locationId',
      'description',
      'locationType',
      'agencyId',
      'parentLocationId',
      'currentOccupancy',
      'locationPrefix',
      'userDescription',
    ],
    links: {
      locationId: 'location',
    //currentOccupancy: 'liveRoll',
      currentOccupancy: 'inmates',
    },
    locations: locations,
    recordCount: locations && locations[0] && locations[0].recordCount || 0,
  });

const createLocationViewModel = (location) =>
({
  columns: [
    'locationId',
    'description',
    'locationType',
    'agencyId',
    'parentLocationId',
    'currentOccupancy',
    'locationPrefix',
    'userDescription',
  ],
  location: location,
});

const createInmatesViewModel = (inmates) =>
  ({
    columns: [
      'offenderNo',
      'firstName',
      'middleName',
      'lastName',
      'dateOfBirth',
      'age',
      'agencyId',
      'assignedLivingUnitId',
      'bookingNo',
      'iepLevel',
    ],
    links: {
      bookingNo: 'booking',
      offenderNo: 'offender',
      agencyId: 'agency',
      assignedLivingUnitId: 'assignedLivingUnit',
    },
    inmates: inmates,
    recordCount: inmates && inmates[0] && inmates[0].recordCount || 0,
  });

const renderLocationsList = (res, transform) => helpers.format(res, 'locations/list', transform);
const renderLocation = (res, transform) => helpers.format(res, 'locations/detail', transform);
const renderInmatesList = (res, transform) => helpers.format(res, 'locations/inmates', transform);

const listLocations = (req, res, next) =>
  proxy(services.location, 'list', req.query.search)
    .then(renderLocationsList(res, createLocationsViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveLocation = (req, res, next) =>
  proxy(services.location, 'getDetails', req.params.locationId)
    .then(renderLocation(res, createLocationViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveInmates = (req, res, next) =>
  proxy(services.location, 'listInmates', req.params.locationId, req.query.search)
    .then(renderInmatesList(res, createInmatesViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listLocations);
router.get('/:locationId', retrieveLocation);
router.get('/:locationId/inmates', retrieveInmates);

module.exports = router;
