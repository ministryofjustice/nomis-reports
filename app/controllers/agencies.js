const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const AgencyService = require('../services/AgencyService');

const services = {};
let setUpServices = (config) => {
  services.agency = services.agency || new AgencyService(config);

  setUpServices = () => {};
};

const createAgenciesViewModel = (agencies) =>
  ({
    columns: [
      'agencyId',
      'description',
      'agencyType',
    ],
    links: {
      agencyId: 'agency',
    },
    agencies,
    recordCount: agencies && agencies[0] && agencies[0].recordCount || 0,
  });

const createAgencyLocationsViewModel = (locations) =>
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
    agencyId: 'agency',
    locationId: 'location',
  },
  locations,
  recordCount: locations && locations[0] && locations[0].recordCount || 0,
});

const createAgencyViewModel = (agency) => ({ agency });

const renderAgencyList = (res, transform) => helpers.format(res, 'agencies/list', transform);
const renderAgency = (res, transform) => helpers.format(res, 'agencies/detail', transform);
const renderAgencyLocationsList = (res, transform) => helpers.format(res, 'agencies/locations', transform);

const listAgencies = (req, res, next) =>
  services.agency.list(req.query.search)
    .then(renderAgencyList(res, createAgenciesViewModel))
    .catch(helpers.failWithError(res, next));

const listAgencyTypes = (req, res, next) =>
  services.agency.listTypes(req.query.search)
    .then(renderAgencyList(res, createAgenciesViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveAgency = (req, res, next) =>
  services.agency.getDetails(req.params.agencyId)
    .then(renderAgency(res, createAgencyViewModel))
    .catch(helpers.failWithError(res, next));

const listAgencyLocations = (req, res, next) =>
  services.agency.listLocations(req.query.search)
    .then(renderAgencyLocationsList(res, createAgencyLocationsViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listAgencies);
router.get('/types', listAgencyTypes);
router.get('/:agencyId', retrieveAgency);
router.get('/:agencyId/locations', listAgencyLocations);

module.exports = router;
