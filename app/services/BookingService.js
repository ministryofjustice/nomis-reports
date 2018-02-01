const BookingRepository = require('../repositories/BookingRepository');
const CachingRepository = require('../helpers/CachingRepository');
const RetryingRepository = require('../helpers/RetryingRepository');

const describe = (name, promise, alt) =>
  promise.then((data) => ({ [name]: (data || alt) }));

const batchRequest = (func, opts, out) =>
  func(++opts.page)
    .then((data) => {
      if (data.length > 0) {
        data.forEach((x) => out.push(x));
        return batchRequest(func, opts, out);
      }
    });

const batchProcess = (func, size) => {
  let opts = { page: 0 };
  let out = [];

  let batch = [];
  for (let i = 0; i < size; i++) {
    batch.push(batchRequest(func, opts, out));
  }

  return Promise.all(batch)
    .catch(() => console.log('THERE WERE ERRORS'))
    .then(() => console.log('DONE', out.length))
    .then(() => [...new Set(out)]);
};

function BookingService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(new RetryingRepository(new BookingRepository(config)));
}

BookingService.prototype.all = function (query) {
  return batchProcess((pageOffset = 0) => this.list(query || {}, pageOffset), 20);
};

BookingService.prototype.list = function (query, pageOffset) {
  return this.repository.list(query, pageOffset)
    .then((x) => x.map((x) => `/bookings/${x.bookingId}`));
};

BookingService.prototype.getDetails = function (bookingId) {
  return this.repository.getDetails(bookingId)
    .then((data) => {
      if (data.assignedLivingUnit && data.assignedLivingUnit.locationId) {
        data.assignedLivingUnitId = data.assignedLivingUnit.locationId;
        delete data.assignedLivingUnit;
      }

      return data;
    });
};

BookingService.prototype.allDetails = function (bookingId) {
  return Promise.all([
    this.getDetails(bookingId),
    describe('sentenceDetail', this.repository.getSentenceDetail(bookingId)),
    describe('mainOffence', this.repository.getMainOffence(bookingId)),
    describe('iepSummary', this.repository.getIepSummary(bookingId)),
    describe('aliases', this.repository.listAliases(bookingId), []),
    describe('adjudications', this.repository.listAdjudications(bookingId), []),
    describe('alerts', this.repository.listAlerts(bookingId)
      .then((x) => x.map((alert) => ({
        id: `/bookings/${bookingId}/alerts/${alert.alertId}`,
        code: alert.alertCode,
        type: alert.alertType,
        label: alert.alertCodeDescription,
        typeLabel: alert.alertTypeDescription,
        createdDate: alert.dateCreated,
        isExpired: alert.expired,
      }))), []),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}))
  .then((data) => Object.assign(
    {
      id: `/bookings/${data.bookingId}`,
    },
    data,
    {
      assignedLivingUnit: data.assignedLivingUnitId ? `/locations/${data.assignedLivingUnitId}` : undefined,
      assessment: data.assessments.map((x) => ({
        classification: x.classification,
        type: x.assessmentCode,
        label: x.assessmentDescription,
        cellSharingAlert: x.cellSharingAlertFlag, // isCellSharingRisk ??
        assessmentDate: x.assessmentDate,
        nextReviewDate: x.nextReviewDate
      })),
      alias: data.aliases.map((x) => {
        x.type = x.nameType;
        delete x.nameType;

        x.createdDate = x.createDate;
        delete x.createDate;

        delete x.rnum;
        return x;
      }),
      profileInformation: data.profileInformation.map((x) => ({
        type: x.type,
        label: x.question,
        value: x.resultValue,
      })),
    }))
  .then((booking) => {
    delete booking.bookingId;
    delete booking.alertsCodes;
    delete booking.activeAlertCount;
    delete booking.inactiveAlertCount;
    delete booking.facialImageId;

    delete booking.assignedLivingUnitId;

    delete booking.sentenceDetail.bookingId;
    delete booking.iepSummary.bookingId;

    delete booking.assessments;
    delete booking.aliases;

    if (booking.iepSummary) {
      booking.iepSummary = {
        date: booking.iepSummary.iepDate,
        time: booking.iepSummary.iepTime,
        level: booking.iepSummary.iepLevel,
        daysSinceReview: booking.iepSummary.daysSinceReview,
        details: booking.iepSummary.iepDetails,
      };
    }

    return booking;
  });
};

BookingService.prototype.getSentenceDetail = function (bookingId) {
  return this.repository.getSentenceDetail(bookingId);
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

BookingService.prototype.listAlerts = function (bookingId, query) {
  return this.repository.listAlerts(bookingId, query);
};

module.exports = BookingService;
