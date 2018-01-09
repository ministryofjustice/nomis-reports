const BookingRepository = require('../repositories/BookingRepository');
const CachingRepository = require('../helpers/CachingRepository');

function BookingService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(BookingRepository, config);
}

BookingService.prototype.list = function (query) {
  return this.repository.list(query);
};

BookingService.prototype.getDetails = function (bookingId) {
  return this.repository.getDetails(bookingId);
};

BookingService.prototype.getSentenceDetail = function (bookingId) {
  return this.repository.getSentenceDetail(bookingId);
  /*
  return Promise.all(this.repository.getDetails(bookingId), this.repository.getSentenceDetail(bookingId))
    .then((data) => ({ booking: data[0], sentenceDetail: data[1] }));
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

module.exports = BookingService;
