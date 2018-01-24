const BookingRepository = require('../repositories/BookingRepository');
const CachingRepository = require('../helpers/CachingRepository');

const describe = (name, promise, alt) =>
  promise.then((data) => ({ [name]: (data || alt) }));

function BookingService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(BookingRepository, config);
}

BookingService.prototype.list = function (query, pageOffset) {
  return this.repository.list(query, pageOffset);
};

BookingService.prototype.getDetails = function (bookingId) {
  return this.repository.getDetails(bookingId);
};

BookingService.prototype.getSentenceDetail = function (bookingId) {
  return this.repository.getSentenceDetail(bookingId);
  /*
  return Promise.all([
    this.repository.getSentenceDetail(bookingId),
    describe('booking', this.repository.getDetails(bookingId)),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}));
  */
};

BookingService.prototype.getMainOffence = function (bookingId) {
  return this.repository.getMainOffence(bookingId);
};

BookingService.prototype.getIepSummary = function (bookingId) {
  return this.repository.getIepSummary(bookingId);
};

BookingService.prototype.listAliases = function (bookingId, query) {
  return this.repository.listAliases(bookingId, query);
};

BookingService.prototype.listContacts = function (bookingId, query) {
  return this.repository.listContacts(bookingId, query);
};

BookingService.prototype.listAdjudications = function (bookingId, query) {
  return this.repository.listAdjudications(bookingId, query);
};

BookingService.prototype.allDetails = function (bookingId) {
  return Promise.all([
    this.repository.getDetails(bookingId),
    describe('sentenceDetail', this.repository.getSentenceDetail(bookingId)),
    describe('mainOffence', this.repository.getMainOffence(bookingId)),
    describe('iepSummary', this.repository.getIepSummary(bookingId)),
    describe('aliases', this.repository.listAliases(bookingId), []),
    describe('contacts', this.repository.listContacts(bookingId), []),
    describe('adjudications', this.repository.listAdjudications(bookingId), []),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}));
};

module.exports = BookingService;
