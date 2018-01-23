const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const links = require('../helpers/links');
const BookingService = require('../services/BookingService');
const extractBookings = require('./extracts');

const map = (fn) => (x) =>
  x && (Array.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) => {
  if (x[p]) {
    (x.links = x.links || {})[k] = fn(x[p]);
  }

  return x;
};

const addBookingLinks = (p) => expandLink(p, 'booking', links.booking);
const addSentenceDetailLinks = (p) => expandLink(p, 'sentenceDetail', links.sentenceDetail);
const addMainOffenceLinks = (p) => expandLink(p, 'mainOffence', links.mainOffence);
const addAliasesLinks = (p) => expandLink(p, 'aliases', links.aliases);
const addContactsLinks = (p) => expandLink(p, 'contacts', links.contacts);
const addAdjudicationsLinks = (p) => expandLink(p, 'adjudications', links.adjudications);
const addIepSummaryLinks = (p) => expandLink(p, 'iepSummary', links.iepSummary);
const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);
const addCustodyStatusLinks = (p) => expandLink(p, 'custodyStatus', links.custodyStatus);
const addAssignedLivingUnitLinks = (p) => expandLink(p, 'assignedLivingUnit', links.location);

const services = {};
const setUpServices = (config) => {
  services.booking = services.booking || new BookingService(config);
};

const proxy = (service, fn, params) =>
  service[fn].call(service, params)
    .then(map((data) => {
      if (data.assignedLivingUnit && data.assignedLivingUnit.locationId) {
        data.assignedLivingUnit = data.assignedLivingUnit.locationId;
      }
      return data;
    }))
    .then(map(addBookingLinks('bookingId')))
    .then(map(addSentenceDetailLinks('bookingId')))
    .then(map(addMainOffenceLinks('bookingId')))
    .then(map(addAliasesLinks('bookingId')))
    .then(map(addContactsLinks('bookingId')))
    .then(map(addAdjudicationsLinks('bookingId')))
    .then(map(addIepSummaryLinks('bookingId')))
    .then(map(addOffenderLinks('offenderNo')))
    .then(map(addCustodyStatusLinks('offenderNo')))
    .then(map(addAssignedLivingUnitLinks('assignedLivingUnit')));

const createBookingsListViewModel = (bookings) =>
  ({
    columns: [
      'offenderNo',
      'firstName',
      'middleName',
      'lastName',
      'dateOfBirth',
      'age',
      'agencyId',
      'assignedLivingUnitDesc',
      'bookingNo',
      'facialImageId',
    ],
    links: {
      offenderNo: 'offender',
      agencyId: 'agency',
      bookingNo: 'booking',
    },
    bookings,
    recordCount: bookings && bookings[0] && bookings[0].recordCount || 0,
  });

const createBookingViewModel = (booking) => ({ booking });
const createSentenceDetailViewModel = (sentenceDetail) => ({ sentenceDetail });
const createMainOffenceViewModel = (mainOffence) => ({ mainOffence });
const createIepSummaryViewModel = (iepSummary) => ({ iepSummary });

const renderer = (view) => (res, transform) => helpers.format(res, `bookings/${view}`, transform);
const renderBookingsList = renderer('list');
const renderBooking = renderer('detail');
const renderSentenceDetail = renderer('sentenceDetail');
const renderMainOffence = renderer('mainOffence');
const renderIepSummary = renderer('iepSummary');

const listBookings = (req, res, next) =>
  proxy(services.booking, 'list', req.query.query)
    .then(renderBookingsList(res, createBookingsListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingDetails = (req, res, next) =>
  proxy(services.booking, 'getDetails', req.params.bookingId)
    .then(renderBooking(res, createBookingViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingSentenceDetail = (req, res, next) =>
  proxy(services.booking, 'getSentenceDetail', req.params.bookingId)
    .then(renderSentenceDetail(res, createSentenceDetailViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingMainOffence = (req, res, next) =>
  proxy(services.booking, 'getMainOffence', req.params.bookingId)
    .then(renderMainOffence(res, createMainOffenceViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingIepSummary = (req, res, next) =>
  proxy(services.booking, 'getIepSummary', req.params.bookingId, { withDetails: true })
    .then(renderIepSummary(res, createIepSummaryViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingAliases = (req, res, next) =>
  proxy(services.booking, 'listAliases', req.query.search)
  //.then(renderAliasesList(res, createAliasesListViewModel))
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveBookingContacts = (req, res, next) =>
  proxy(services.booking, 'listContacts', req.query.search)
  //.then(renderContactsList(res, createContactsListViewModel))
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

const retrieveBookingAdjudications = (req, res, next) =>
  proxy(services.booking, 'listAdjudications', req.query.search)
  //.then(renderAdjudicationsList(res, createAdjudicationsListViewModel))
    .then((response) => res.json(response.body))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listBookings);
router.get('/:bookingId', retrieveBookingDetails);
router.get('/:bookingId/sentenceDetail', retrieveBookingSentenceDetail);
router.get('/:bookingId/mainOffence', retrieveBookingMainOffence);
router.get('/:bookingId/iepSummary', retrieveBookingIepSummary);
router.get('/:bookingId/aliases', retrieveBookingAliases);
router.get('/:bookingId/contacts', retrieveBookingContacts);
router.get('/:bookingId/adjudications', retrieveBookingAdjudications);


module.exports = router;
