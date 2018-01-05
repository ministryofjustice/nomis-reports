const express = require('express');
const router = new express.Router();

const util = require('util');
const helpers = require('../helpers');
const links = require('../helpers/links');
const eliteApiAgent = require('../helpers/eliteApiAgent');
const bookingsService = require('../repositories/bookings');

const map = (fn) => (x) =>
  x && (util.isArray(x) ? x.map(fn) : fn(x));

const expandLink = (p, k, fn) => (x) =>
  ((x.links = x.links || {})[k] = fn(x[p])) && x;

const addBookingLinks = (p) => expandLink(p, 'booking', links.booking);
const addSentenceDetailLinks = (p) => expandLink(p, 'sentenceDetail', links.sentenceDetail);
const addMainOffenceLinks = (p) => expandLink(p, 'mainOffence', links.mainOffence);
const addAliasesLinks = (p) => expandLink(p, 'aliases', links.aliases);
const addContactsLinks = (p) => expandLink(p, 'contacts', links.contacts);
const addAdjudicationsLinks = (p) => expandLink(p, 'adjudications', links.adjudications);
const addIepSummaryLinks = (p) => expandLink(p, 'iepSummary', links.iepSummary);
const addOffenderLinks = (p) => expandLink(p, 'offender', links.offender);
const addAssignedLivingUnitLinks = (p) => expandLink(p, 'location', links.location);
const addAgencyLinks = (p) => expandLink(p, 'agency', links.agency);

const list = (req) =>
  req.app.locals.bookingsService
    .list({ query: req.query.search })
    .set('Page-Limit', 1000);

const getDetails = (req) =>
  req.app.locals.bookingsService.getDetails({ bookingId: req.params.bookingId });

const getSentenceDetail = (req) =>
  req.app.locals.bookingsService.getSentenceDetail({ bookingId: req.params.bookingId });

const getMainOffence = (req) =>
  req.app.locals.bookingsService.getMainOffence({ bookingId: req.params.bookingId });

const listAliases = (req) =>
  req.app.locals.bookingsService.listAliases({ bookingId: req.params.bookingId });

const listContacts = (req) =>
  req.app.locals.bookingsService.listContacts({ bookingId: req.params.bookingId });

const listAdjudications = (req) =>
  req.app.locals.bookingsService.listAdjudications({ bookingId: req.params.bookingId });

const getIepSummary = (req) =>
  req.app.locals.bookingsService.getIepSummary({ bookingId: req.params.bookingId }, { withDetails: true });

const proxy = (fn, req) =>
  fn(req)
    .then((response) => response.body)
    .then(map((data) => {
      data.assignedLivingUnitId = data.assignedLivingUnit && data.assignedLivingUnit.locationId;
      return data;
    }))
    .then(map((data) => {
      data.agencyId = data.assignedLivingUnit && data.assignedLivingUnit.agencyId;
      return data;
    }))
    .then(map(addAgencyLinks('agencyId')))
    .then(map(addBookingLinks('bookingId')))
    .then(map(addSentenceDetailLinks('bookingId')))
    .then(map(addMainOffenceLinks('bookingId')))
    .then(map(addAliasesLinks('bookingId')))
    .then(map(addContactsLinks('bookingId')))
    .then(map(addAdjudicationsLinks('bookingId')))
    .then(map(addIepSummaryLinks('bookingId')))
    .then(map(addOffenderLinks('offenderNo')))
    .then(map(addAssignedLivingUnitLinks('assignedLivingUnitId')));

const createBookingListViewModel = (bookings) =>
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
      bookingNo: 'booking'
    },
    bookings: bookings,
    recordCount: bookings[0].recordCount,
  });

const renderBookingList = (res, transform) => helpers.format(res, 'bookings/list', transform);

const allBookings = (req, res, next) =>
  proxy(list, req)
    .then(renderBookingList(res, createBookingListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingDetails = (req, res, next) =>
  proxy(getDetails, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingSentenceDetail = (req, res, next) =>
  proxy(getSentenceDetail, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingMainOffence = (req, res, next) =>
  proxy(getMainOffence, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingAliases = (req, res, next) =>
  proxy(listAliases, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingContacts = (req, res, next) =>
  proxy(listContacts, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingAdjudications = (req, res, next) =>
  proxy(listAdjudications, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingIepSummary = (req, res, next) =>
  proxy(getIepSummary, req)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  let config = req.app.locals.config.elite2;
  let agent = eliteApiAgent(undefined, undefined, config);

  req.app.locals.bookingsService = req.app.locals.bookingsService || bookingsService(agent, config.apiUrl);

  next();
});
router.get('/', allBookings);
router.get('/:bookingId', retrieveBookingDetails);
router.get('/:bookingId/sentenceDetail', retrieveBookingSentenceDetail);
router.get('/:bookingId/mainOffence', retrieveBookingMainOffence);
router.get('/:bookingId/aliases', retrieveBookingAliases);
router.get('/:bookingId/contacts', retrieveBookingContacts);
router.get('/:bookingId/adjudications', retrieveBookingAdjudications);
router.get('/:bookingId/iepSummary', retrieveBookingIepSummary);

module.exports = router;
