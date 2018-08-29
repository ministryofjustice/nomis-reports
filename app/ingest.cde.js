const fs = require('fs');
const moment = require('moment');

const RequestQueue = require('./helpers/RequestQueue');
const ReportsService = require('./services/ReportsService');

const CDEModel = require('./models/CDE');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  reports: new ReportsService(config),
};

const getFirst = a => a[0] || {};
const ofList = a => a || [];

const getValidLocation = (mainBooking, lastMovement) => {
  switch (mainBooking.agencyLocationId) {
    case 'OUT':
      return lastMovement.fromAgencyLocationId;
    case 'TRN':
      return lastMovement.toAgencyCodeLocationId;
    default:
      return mainBooking.agencyLocationId !== 'ZZGHI' ? mainBooking.agencyLocationId : undefined;
  }
};

const isCDEEntry = (data, extractDate) => {
  let mainBooking = getFirst(ofList(data.bookings));
  let lastMovement = mainBooking.lastMovement || {};

  if (!getValidLocation(mainBooking, lastMovement)) {
    return false;
  }

  if (mainBooking.bookingStatus === 'O') {
    // Active-Out (CRT), Active-Out (TAP), Active-In
    if (mainBooking.activeFlag) {
      let movementDate =
        (~['CRT', 'TAP'].indexOf(lastMovement.movementTypeCode) && lastMovement.movementDirection === 'OUT') ?
          moment(lastMovement.movementDateTime) : extractDate;

      return movementDate.diff(extractDate.clone().subtract(7, 'days')) >= 0;
    }

    // In-Transit
    if (lastMovement.movementTypeCode === 'TRN') {
      return true;
    }
  }

  // Active-UAL, UAL_ECL, UAL (Escape), Inactive-Out
  if (lastMovement.movementTypeCode === 'REL') {
    let movementDate =
      ~['ESCP', 'UAL', 'UAL_ECL'].indexOf(lastMovement.movementReasonCode) ?
        extractDate : moment(lastMovement.movementDateTime);

    return movementDate.diff(extractDate.clone().subtract(7, 'days')) >= 0;
  }
};

let reportName = 'CDE';
let extractDate = moment(/*'2018-07-17T22:00:00.000Z'*/);
let builder = CDEModel.build(extractDate.clone());
let entryChecker = isCDEEntry;

// start of routine

let now = moment();
let ep = `./.extracts/reports/${reportName}/${extractDate.format('YYYYMMDD.HHmm')}.json`;
let ws = fs.createWriteStream(ep, 'utf8');
let size = 100;

let rq;
let isFirst = true;
let jobDone = false;
let listComplete = false;
let totalEntries = 0;
let entries = 0;

let getContent = (response) => response._embedded.offenders;

let lastPage = 0;
let setupQueue = (batch, totalPages) => {
  lastPage = totalPages;

  let sets = [];
  for (let i = 0; i < totalPages; i++) {
    sets.push({ type: 'list', page: i + 1, size: batch.size });
  }

  rq.push(sets);

  setupQueue = () => {};
};

let startJob = () => {
  setInterval(() => {
    log.info(Object.assign({}, rq.report(), { start: now }), `${reportName} INGEST ON PROGRESS`);

    if (jobDone) {
      process.exit();
    }
  }, 10000);

  ws.write('[\n');
  rq.push({ type: 'list', page: 0, size });

  startJob = () => {};
};

const completeJob = () => {
  ws.write('\n]\n');

  log.info(Object.assign({}, rq.report(), { start: now, end: new Date() }), `${reportName} INGEST ON COMPLETE`);

  jobDone = true;
};

rq = new RequestQueue((batch, done) => {
    log.info({ batch }, `${reportName} INGEST ON DATA`);

    if (batch.type === 'list') {
      services.reports.listOffenders({}, batch.page, batch.size)
        .then((response) => {
          setupQueue(batch, response.page.totalPages - 1);

          getContent(response).forEach(data => {
            if (entryChecker(data, extractDate)) {
              rq.push({
                type: 'entry',
                offenderId: data.offenderId,
              });

              log.info({ offenderId: data.offenderId }, `${reportName} Entry Identified`);

              totalEntries++;
            }
          });

          if (response.page.number === lastPage) {
            listComplete = true;

            if (totalEntries === 0) {
              completeJob();
            }
          }

          done();
        })
        .catch((err) => {
          log.error(err, `${reportName} INGEST ON ERROR`);
          done();
        });
      }

      if (batch.type === 'entry') {
        services.reports.getDetails(batch.offenderId)
          .then(builder)
          .then(data => {
            if (!isFirst) {
              ws.write(',\n');
            }
            isFirst = false;

            let entry = JSON.stringify(data, null, '  ');
            ws.write(`${entry}`);

            entries++;

            if (listComplete && entries === totalEntries) {
              completeJob();
            }

            done();
          })
          .catch((err) => {
            log.error(err, `${reportName} ${batch.offenderId} INGEST ON ERROR`);
            done();
          });
      }
  }, { concurrency: 10 });

startJob();
