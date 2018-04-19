const fs = require('fs');

const ReportsService = require('./services/ReportsService');
const RequestQueue = require('./helpers/RequestQueue');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  reports: new ReportsService(config)
};

let reportName = 'offenders';
let reportMethod = 'listOffenders';
let getContent = (response) => response._embedded.offenders;

const isAOentry = (data, extractDate) => {
  let mainBooking = data.booking[0];
  let lastMovement = data.movements[data.movements.length - 1];

  return (mainBooking.agencyLocationId && mainBooking.agencyLocationId !== 'ZZGHI') &&
      (new Date(mainBooking.bookingBeginDate) < extractDate) &&
      (new Date(lastMovement.movementDate) >= extractDate) &&
      (mainBooking.activeFlag === 'Y' || lastMovement.directionCode === 'OUT') &&
      (lastMovement.movementType !== 'ADM' || !lastMovement.movementType);
};

let rq;
let now = new Date();
let ep = `./.extracts/reports/${reportName}/${now.getTime()}.json`;
let ws = fs.createWriteStream(ep, 'utf8');
let size = 10;

let setupQueue = (batch, totalPages) => {
  let sets = [];
  for (let i = 0; i < totalPages; i++) {
    sets.push({ page: i + 1, size: batch.size });
  }

  rq.push(sets);

  setupQueue = () => {};
};

rq = new RequestQueue((batch, done) => {
    log.info({ batch }, `${reportName} RequestQueue ON DATA`);

    services.reports[reportMethod]({}, batch.page, batch.size)
      .then((response) => {
        log.info({ batch }, `${reportName} RequestQueue ON RESPONSE`);

        setupQueue(batch, response.page.totalPages - 1);

        getContent(response).forEach(data => {
          // check for extract inclusion
          if (isAOentry(data, new Date())) {
            let json = JSON.stringify({
              offenderId: data.offenderId,
              offenderNo: data.offenderNo,
              bookingId: data.bookingId,
              bookingNo: data.bookingNo,
            });
            /*
            services.reports.getAODetails(data.offenderId)
              .then(data => {
                ws.write(JSON.stringify(data));
              });
            */
            ws.write(json);
          }
        });

        done();

        if (response.page.number === response.page.totalPages) {
          ws.write(']');

          log.info(Object.assign({}, rq.report(), { start: now, end: new Date() }), `${reportName} RequestQueue ON COMPLETE`);

          process.exit();
        }
      })
      .catch((err) => {
        log.error(err, `${reportName} RequestQueue ON ERROR`);
        done();
      });
  }, { concurrency: 10 });

setInterval(() => {
  log.info(Object.assign({}, rq.report(), { start: now }), `${reportName} RequestQueue ON PROGRESS`);
}, 10000);

ws.write('[');
rq.push({ page: 0, size });
