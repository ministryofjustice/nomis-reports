const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const links = require('../helpers/links');
const AgencyService = require('../services/AgencyService');

const map = (fn) => (x) =>
  x && (Array.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addAgencyLinks = (p) => expandLink(p, 'agency', links.agency);
const addPrisonLiveRollLinks = (p) => expandLink(p, 'liveRoll', links.prisonLiveRoll);
const addLocationLinks = (p) => expandLink(p, 'location', links.location);
const addAgencyLocationsLinks = (p) => expandLink(p, 'locations', links.agencyLocations);
const addAgencyContactDetailsLinks = (p) => expandLink(p, 'contactDetails', links.agencyContactDetails);

const services = {};
const setUpServices = (config) => {
  services.agency = services.agency || new AgencyService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map(addAgencyLinks('agencyId')))
    .then(map(addAgencyContactDetailsLinks('agencyId')))
    .then(map(addAgencyLocationsLinks('agencyId')))
    .then(map(addPrisonLiveRollLinks('agencyId')))
    .then(map(addLocationLinks('locationId')));

const createAgenciesViewModel = (agencies) =>
  ({
    columns: [
      'agencyId',
      'description',
      'agencyType',
    ],
    links: {
      agencyId: 'agency',
    //agencyId: 'liveRoll',
    },
    agencies,
    recordCount: agencies && agencies[0] && agencies[0].recordCount || 0,
  });

const createAgencyContactDetailsListViewModel = (contactDetails) =>
({
  columns: [
    'agencyId',
    'addressType',
    'premise',
    'locality',
    'city',
    'country',
    'postCode',
  ],
  links: {
    agencyId: 'agency',
    agencyId: 'contactDetails',
  },
  contactDetails,
  recordCount: contactDetails && contactDetails[0] && contactDetails[0].recordCount || 0,
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
  //agencyId: 'liveRoll',
  },
  locations,
  recordCount: locations && locations[0] && locations[0].recordCount || 0,
});

const createAgencyViewModel = (agency) => ({ agency });
const createAgencyContactDetailsViewModel = (contactDetails) => ({ contactDetails });

const renderAgencyList = (res, transform) => helpers.format(res, 'agencies/list', transform);
const renderAgencyContactDetailsList = (res, transform) => helpers.format(res, 'agencies/contactsDetailslist', transform);
const renderAgency = (res, transform) => helpers.format(res, 'agencies/detail', transform);
const renderAgencyContactDetails = (res, transform) => helpers.format(res, 'agencies/contactDetails', transform);
const renderAgencyLocationsList = (res, transform) => helpers.format(res, 'agencies/locations', transform);

const listAgencies = (req, res, next) =>
  proxy(services.agency, 'list', req.query.search)
    .then(renderAgencyList(res, createAgenciesViewModel))
    .catch(helpers.failWithError(res, next));

const listAgencyContactDetails = (req, res, next) =>
  proxy(services.agency, 'listContactDetails', req.query.search)
    .then(renderAgencyContactDetailsList(res, createAgencyContactDetailsListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveAgency = (req, res, next) =>
  proxy(services.agency, 'getDetails', req.params.agencyId)
    .then(renderAgency(res, createAgencyViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveAgencyContactDetails = (req, res, next) =>
  proxy(services.agency, 'getContactDetails', req.params.agencyId)
    .then(renderAgencyContactDetails(res, createAgencyContactDetailsViewModel))
    .catch(helpers.failWithError(res, next));

const listAgencyLocations = (req, res, next) =>
  proxy(services.agency, 'listLocations', req.query.search)
    .then(renderAgencyLocationsList(res, createAgencyLocationsViewModel))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listAgencies);
router.get('/contactDetails', listAgencyContactDetails);
router.get('/:agencyId', retrieveAgency);
router.get('/:agencyId/contactDetails', retrieveAgencyContactDetails);
router.get('/:agencyId/locations', listAgencyLocations);

module.exports = router;
