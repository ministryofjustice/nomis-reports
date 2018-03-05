const log = require('../../server/log');

const ProcessAgent = require('../helpers/MainProcessAgent');
const BatchProcessor = require('../helpers/BatchProcessor');

const describe = (name, promise, alt, map) =>
  promise
    .then((data) => ({ [name]: (data || alt) }))
    .then((data) => data.map && map ? data.map(map) : data)
    .catch((err) => {
      log.error(err, { name }, 'BookingService describe ERROR');

      return alt;
    });

function BookingService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

BookingService.prototype.all = function (query, pageSize = 10, concurrency = 1) {
  let batch = new BatchProcessor({ concurrency });
  return batch.run((pageOffset = 0) => this.list(query || {}, pageOffset, pageSize));
};

BookingService.prototype.list = function (query, pageOffset, pageSize) {
  return this.agent.request('booking', 'list', query, pageOffset, pageSize)
    .then((x) => (x || []).map((x) => ({
        id: `/bookings/${x.bookingId}`,
        bookingNo: `/bookings/bookingNo/${x.bookingNo}`,
        offenderNo: `/offenders/${x.offenderNo}`,
      })));
};

BookingService.prototype.listFull = function (query, pageOffset, pageSize) {
  return this.agent.request('booking', 'list', query, pageOffset, pageSize)
    .then((x) => (x || []).map((x) => ({
        id: `/bookings/${x.bookingId}`,
        bookingNo: `/bookings/bookingNo/${x.bookingNo}`,
        offenderNo: `/offenders/${x.offenderNo}`,
        booking: x,
      })));
};

BookingService.prototype.getDetails = function (bookingId, query) {
  return this.agent.request('booking', 'getDetails', bookingId, query)
    .then((data) => {
      if (data.assignedLivingUnit && data.assignedLivingUnit.locationId) {
        data.assignedLivingUnitId = data.assignedLivingUnit.locationId;
        delete data.assignedLivingUnit;
      }

      return data;
    });
};

BookingService.prototype.allDetails = function (bookingId, query) {
  return Promise.all([
    this.getDetails(bookingId, Object.assign({ basicInfo: true }, query))
      .catch((err) => {
        log.error(err, { bookingId }, 'BookingService allDetails ERROR');

        return { bookingId };
      }),
    describe('sentenceDetail', this.getSentenceDetail(bookingId, query), undefined),
    describe('mainOffence', this.getMainOffence(bookingId, query), undefined),
    describe('iepSummary', this.getIepSummary(bookingId, query), undefined),
    describe('aliases', this.listAliases(bookingId, query), []),
    describe('adjudications', this.listAdjudications(bookingId, query), []),
    describe('alerts', this.listAlerts(bookingId, query), [], (alert) => ({
        id: `/bookings/${bookingId}/alerts/${alert.alertId}`,
        code: alert.alertCode,
        type: alert.alertType,
        label: alert.alertCodeDescription,
        typeLabel: alert.alertTypeDescription,
        createdDate: alert.dateCreated,
        isExpired: alert.expired,
      })),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}))
  .then((data) => Object.assign(
    {
      id: `/bookings/${data.bookingId}`,
    },
    data,
    {
      assignedLivingUnit: data.assignedLivingUnitId ? `/locations/${data.assignedLivingUnitId}` : undefined,
      assessment: data.assessments ? data.assessments.map((x) => ({
        classification: x.classification,
        type: x.assessmentCode,
        label: x.assessmentDescription,
        cellSharingAlert: x.cellSharingAlertFlag, // isCellSharingRisk ??
        assessmentDate: x.assessmentDate,
        nextReviewDate: x.nextReviewDate
      })) : undefined,
      alias: data.aliases ? data.aliases.map((x) => {
        x.type = x.nameType;
        delete x.nameType;

        x.createdDate = x.createDate;
        delete x.createDate;

        delete x.rnum;
        return x;
      }) : undefined,
      profileInformation: data.profileInformation ? data.profileInformation.map((x) => ({
        type: x.type,
        label: x.question,
        value: x.resultValue,
      })) : undefined,
    }))
  .then((booking) => {
    delete booking.bookingId;
    delete booking.alertsCodes;
    delete booking.activeAlertCount;
    delete booking.inactiveAlertCount;
    delete booking.facialImageId;

    delete booking.assignedLivingUnitId;

    if (booking.sentenceDetail) {
      delete booking.sentenceDetail.bookingId;
    }
    if (booking.iepSummary) {
      delete booking.iepSummary.bookingId;
    }

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

BookingService.prototype.getSentenceDetail = function (bookingId, query) {
  return this.agent.request('booking', 'getSentenceDetail', bookingId, query);
};

BookingService.prototype.getMainOffence = function (bookingId, query) {
  return this.agent.request('booking', 'getMainOffence', bookingId, query);
};

BookingService.prototype.getIepSummary = function (bookingId, query) {
  return this.agent.request('booking', 'getIepSummary', bookingId, query);
};

BookingService.prototype.listAliases = function (bookingId, query) {
  return this.agent.request('booking', 'listAliases', bookingId, query);
};

BookingService.prototype.listContacts = function (bookingId, query) {
  return this.agent.request('booking', 'listContacts', bookingId, query);
};

BookingService.prototype.listAdjudications = function (bookingId, query) {
  return this.agent.request('booking', 'listAdjudications', bookingId, query);
};

BookingService.prototype.listIdentifiers = function (bookingId, query) {
  return this.agent.request('booking', 'listIdentifiers', bookingId, query);
};

BookingService.prototype.listAlerts = function (bookingId, query) {
  return this.agent.request('booking', 'listAlerts', bookingId, query);
};

BookingService.prototype.listCaseNotes = function (bookingId, query) {
  return Promise.all([
    this.agent.request('booking', 'getDetails', bookingId),
    this.agent.request('booking', 'listCaseNotes', bookingId, query)
  ])
  .then((data) => data[1].map((x) =>({
      id: `/caseNotes/${x.caseNoteId}`,
      bookingId: `/bookings/${x.bookingId}`,
      bookingNo: `/bookings/bookingNo/${data[0].bookingNo}`,
      offenderNo: `/offenders/${data[0].offenderNo}`,

      noteType: `/caseNoteType/${x.type}/${x.subType}`,
      typeDescription: x.typeDescription,
      subtypeDescription: x.subTypeDescription,

      source: x.source,
      timestamp: x.creationDateTime,

      //src: x
    })));
};

module.exports = BookingService;
