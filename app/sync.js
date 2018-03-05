const BookingService = require('./services/BookingService');
const CaseNoteService = require('./services/CaseNoteService');
const RequestQueue = require('./helpers/RequestQueue');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  booking: new BookingService(config),
  caseNote: new CaseNoteService(config),
};

const queue = new RequestQueue({ concurrency: 10 });

queue.onData((row) => {
  log.info(row, 'SYNC update BEGIN');

  services.booking.allDetails(row.bookingId.replace('/bookings/', ''), { basicInfo: true })
    .then(() => {
      log.log(row, 'SYNC update SUCCESS');
    })
    .catch((error) => {
      log.debug(row, 'SYNC update FAIL');
      log.error(error);
    });
});

setInterval(() => {
  log.info(queue.report(), 'cache sync PROGRESS');
}, 10000);

let lastRequested;
const getEvents = () => {
  lastRequested = lastRequested || new Date((new Date()).setTime(new Date().getTime() - 5000000000));

  log.debug({ lastRequested }, 'cache sync REQUESTING EVENTS');

  services.caseNote.list({ from_datetime: lastRequested })
    .then((data) => {
      log.info({ lastRequested, updates: data.length }, 'cache sync RECEIVED EVENTS');

      data.forEach((row) => {
        let nextTS = new Date((new Date()).setTime((new Date(row.notificationTimestamp)).getTime() + 1));;
        if (lastRequested < nextTS) {
          lastRequested = nextTS;
        }

        log.info({ lastRequested , offenderId: row.noms_id }, 'cache sync PUSH EVENT');

        services.booking.all({}, 100, 10)
          .then((data) => {
            log.info({ lastRequested, size: data.length, offenderId: row.noms_id }, 'cache sync BOOKINGS LISTED');

            data.forEach((x) => {
              if (x.offenderNo === `/offenders/${row.noms_id}`) {
                log.info({ lastRequested, id: x.id, offenderNo: x.offenderNo }, 'cache sync BOOKING FOUND');

                services.booking.allDetails(x.id.replace('/bookings/', ''))
                  .then(() => {
                    log.info({ lastRequested, id: x.id, offenderNo: x.offenderNo }, 'cache sync CACHE REFRESHED');
                  });
              }
            });
          });

        if (data.length > 0 ) {
          getEvents();
        } else {
          setTimeout(getEvents, 500);
        }
      });
    })
    .catch((error) => {
      log.error(error, 'cache sync ERROR');
    });
};

getEvents();
