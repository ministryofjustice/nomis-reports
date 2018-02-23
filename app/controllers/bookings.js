const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const BookingService = require('../services/BookingService');

const services = {};
let setUpServices = (config) => {
  services.booking = services.booking || new BookingService(config);

  setUpServices = () => {};
};

const createBookingsListViewModel = (bookings) =>
  ({
    columns: [ 'id', 'offenderNo', 'bookingNo' ],
    links: {},
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
  services.booking.list(req.query, req.query && req.query.page, req.query && req.query.pageSize)
    .then(renderBookingsList(res, createBookingsListViewModel))
    .catch(helpers.failWithError(res, next));

const allBookings = (req, res, next) =>
  services.booking.all(req.query)
    .then(renderBookingsList(res, createBookingsListViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingDetails = (req, res, next) =>
  services.booking.getDetails(req.params.bookingId, req.query)
    .then(renderBooking(res, createBookingViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingSentenceDetail = (req, res, next) =>
  services.booking.getSentenceDetail(req.params.bookingId, req.query)
    .then(renderSentenceDetail(res, createSentenceDetailViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingMainOffence = (req, res, next) =>
  services.booking.getMainOffence(req.params.bookingId, req.query)
    .then(renderMainOffence(res, createMainOffenceViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingIepSummary = (req, res, next) =>
  services.booking.getIepSummary(req.params.bookingId, { withDetails: true })
    .then(renderIepSummary(res, createIepSummaryViewModel))
    .catch(helpers.failWithError(res, next));

const retrieveBookingAliases = (req, res, next) =>
  services.booking.listAliases(req.params.bookingId, req.query)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingContacts = (req, res, next) =>
  services.booking.listContacts(req.params.bookingId, req.query)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingAdjudications = (req, res, next) =>
  services.booking.listAdjudications(req.params.bookingId, req.query)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingIdentifiers = (req, res, next) =>
  services.booking.listIdentifiers(req.params.bookingId, req.query)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

const retrieveBookingCaseNotes = (req, res, next) =>
  services.booking.listCaseNotes(req.params.bookingId, req.query)
    .then((data) => res.json(data))
    .catch(helpers.failWithError(res, next));

router.use((req, res, next) => {
  setUpServices(req.app.locals.config);
  next();
});

router.get('/', listBookings);
router.get('/all', allBookings);
router.get('/:bookingId', retrieveBookingDetails);
router.get('/:bookingId/sentenceDetail', retrieveBookingSentenceDetail);
router.get('/:bookingId/mainOffence', retrieveBookingMainOffence);
router.get('/:bookingId/iepSummary', retrieveBookingIepSummary);
router.get('/:bookingId/aliases', retrieveBookingAliases);
router.get('/:bookingId/contacts', retrieveBookingContacts);
router.get('/:bookingId/adjudications', retrieveBookingAdjudications);
router.get('/:bookingId/identifiers', retrieveBookingIdentifiers);
router.get('/:bookingId/caseNotes', retrieveBookingCaseNotes);


module.exports = router;
