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
      'id',
      'type',
    ],
    links: {
      id: 'ref',
      type: 'ref',
    },
    agencies: (agencies || []),
    recordCount: (agencies || []).length || 0,
  });

const createAgencyTypesViewModel = (types) =>
  ({
    columns: [
      'id',
    ],
    links: {
      id: 'ref',
    },
    types: (types || []),
    recordCount: (types || []).length || 0,
  });

const createAgencyViewModel = (agency) => ({ agency });

const renderAgencyList = (res, transform) => helpers.format(res, 'agencies/list', transform);
const renderAgency = (res, transform) => helpers.format(res, 'agencies/detail', transform);
const renderTypes = (res, transform) => helpers.format(res, 'agencies/types', transform);

const listAgencies = (req, res, next) =>
  services.agency.list(req.query)
    .then(renderAgencyList(res, createAgenciesViewModel))
    .catch(helpers.failWithError(res, next));

const listAgencyTypes = (req, res, next) =>
  services.agency.listTypes(req.query)
    .then(renderTypes(res, createAgencyTypesViewModel))
    .catch(helpers.failWithError(res, next));

const listByAgencyType = (req, res, next) =>
  services.agency.listByType(req.params.typeId, req.query)
    .then(renderAgencyList(res, createAgenciesViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveAgency = (req, res, next) =>
  services.agency.getDetails(req.params.agencyId)
    .then(renderAgency(res, createAgencyViewModel))
    .catch(helpers.failWithError(res, next));

const listAgencyLocations = (req, res, next) =>
  services.agency.getDetails(req.params.agencyId)
    .then(helpers.redirect(res, `/locations?agencyId=${req.params.agencyId}`))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listAgencies);
router.get('/types', listAgencyTypes);
router.get('/types/:typeId', listByAgencyType);
router.get('/:agencyId', retrieveAgency);
router.get('/:agencyId/locations', listAgencyLocations);

module.exports = router;
