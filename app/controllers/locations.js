const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const LocationService = require('../services/LocationService');

const services = {};
let setUpServices = (config) => {
  services.location = services.location || new LocationService(config);

  setUpServices = () => {};
};

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
      currentOccupancy: 'inmates',
    },
    locations,
    recordCount: locations && locations[0] && locations[0].recordCount || 0,
  });

const createLocationViewModel = (location) => ({ location });

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
    inmates,
    recordCount: inmates && inmates[0] && inmates[0].recordCount || 0,
  });

const renderLocationsList = (res, transform) => helpers.format(res, 'locations/list', transform);
const renderLocation = (res, transform) => helpers.format(res, 'locations/detail', transform);
const renderInmatesList = (res, transform) => helpers.format(res, 'locations/inmates', transform);

const listLocations = (req, res, next) =>
  services.location.list(req.query.search)
    .then(renderLocationsList(res, createLocationsViewModel))
    .catch(helpers.failWithError(res, next));

const allLocations = (req, res, next) =>
  services.location.all(req.query.search)
    .then(renderLocationsList(res, createLocationsViewModel))
    .catch(helpers.failWithError(res, next));

const listLocationTypes = (req, res, next) =>
  services.location.listTypes(req.query.search)
    .then(renderLocationsList(res, createLocationsViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveLocation = (req, res, next) =>
  services.location.getDetails(req.params.locationId)
    .then(renderLocation(res, createLocationViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveInmates = (req, res, next) =>
  services.location.listInmates(req.params.locationId, req.query.search)
    .then(renderInmatesList(res, createInmatesViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listLocations);
router.get('/all', allLocations);
router.get('/types', listLocationTypes);
router.get('/:locationId', retrieveLocation);
router.get('/:locationId/inmates', retrieveInmates);

module.exports = router;
