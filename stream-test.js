const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);

const BookingService = require('./app/services/BookingService');
const ExtractorAgent = require('./app/helpers/ExtractorAgent');

const log = require('./server/log');
const config = require('./server/config');

const services = {
  booking: new BookingService(config)
};

const bookingExtractor = new ExtractorAgent({ type: 'bookings', concurrency: 1 });

let extractDetails = bookingExtractor.run({
  list: () => services.booking.all({}, 100, 1),
  detail: (row) => {
    return services.booking.getDetails(row.id.replace('/bookings/', ''));
    /*
      .then((data) => Object.assign({}, row.booking, data,
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
        }
      ))
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
    */
  },
}, (data) => {
  log.info(extractDetails, 'createExtract SUCCESS');

  writeFile(`./.${extractDetails.location}.json`, JSON.stringify(data), 'utf8')
      .then(() => log.info(extractDetails, 'saveExtract SUCCESS'));
});
