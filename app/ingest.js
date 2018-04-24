const fs = require('fs');

const RequestQueue = require('./helpers/RequestQueue');
const ReportsService = require('./services/ReportsService');
const BookingService = require('./services/BookingService');
//const AOModel = require('./models/AO');
const CDEModel = require('./models/CDE');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  reports: new ReportsService(config),
  booking: new BookingService(config)
};

const listAlerts = (data) =>
  services.booking.listAlerts(data.bookings[0].offenderBookingId)
    .catch(err => {
      if (err.status === 404) {
        return Promise.resolve([]);
      }
    })
    .then(alerts => data.alerts = alerts)
    .then(() => data);

let reportName = 'offenders';
let reportMethod = 'listOffenders';
let getContent = (response) => response._embedded.offenders;

const isAOentry = (data, extractDate) => {
  let mainBooking = data.bookings[0];
  let lastMovement = data.movements[data.movements.length - 1];

  return (mainBooking.agencyLocationId && mainBooking.agencyLocationId !== 'ZZGHI') &&
      (new Date(mainBooking.bookingBeginDate) < extractDate) &&
      (new Date(lastMovement.movementDate) >= extractDate) &&
      (mainBooking.activeFlag === 'Y' || lastMovement.directionCode === 'OUT') &&
      (lastMovement.movementType !== 'ADM' || !lastMovement.movementType);
};

const isCDEentry = (o) => {
  let ob = o.bookings[0];

  let status = [];
  if (ob.activeFlag || (!ob.activeFlag && ~['ESCP', 'UAL', 'UAL_ECL'].indexOf(ob.statusReason.substring(5))) || ob.inOutStatus === 'TRN') {
    status.push('Active');
  } else if (!ob.activeFlag && ob.bookingSequence === 1) {
    status.push('INACTIVE');
    return false;
  } else if (!ob.activeFlag && ob.bookingSequence > 1) {
    status.push('HISTORIC');
    return false;
  }

  if (~['ESCP', 'UAL'].indexOf(ob.statusReason.substring(5))) {
    status.push('UAL');
  } else if (~['UAL_ECL'].indexOf(ob.statusReason.substring(5))) {
    status.push('UAL_ECL');
  } else if (ob.inOutStatus === 'TRN') {
    status.push('In Transit');
  } else {
    status.push(ob.inOutStatus.toUpperCase());
  }

  return status.length > 0;
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

let t = 0;
let i = 0;

rq = new RequestQueue((batch, done) => {
    log.info({ batch }, `${reportName} RequestQueue ON DATA`);

    services.reports[reportMethod]({}, batch.page, batch.size)
      .then((response) => {
        log.info({ batch }, `${reportName} RequestQueue ON RESPONSE`);

        setupQueue(batch, response.page.totalPages - 1);

        getContent(response).forEach(data => {
          t++;

          if (isCDEentry(data, new Date())) {
            services.reports.getDetails(data.offenderId)
              .then(listAlerts)
              .then(CDEModel.build)
              .then(cde => {
                i++;
                log.info(data.offenderId, `CDE CANDIDATE ${i} of ${t}`);
                ws.write((i !== 1 ? ',' : '') + JSON.stringify(cde));
              });
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
