const fs = require('fs');
const moment = require('moment');

const RequestQueue = require('./helpers/RequestQueue');
const ReportsService = require('./services/ReportsService');

const AOModel = require('./models/AO');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  reports: new ReportsService(config),
};

const getFirst = a => a[0] || {};
const ofList = a => a || [];

const isAOEntry = (data, extractDate) => {
  let mainBooking = getFirst(ofList(data.bookings));
  let lastMovement = mainBooking.lastMovement || {};
  let isValidLocation = (mainBooking.agencyLocationId && mainBooking.agencyLocationId !== 'ZZGHI');

  return isValidLocation &&
      moment(mainBooking.startDate).diff(extractDate) < 0 &&
      moment(lastMovement.movementDateTime).diff(extractDate) >= 0 &&
      (mainBooking.activeFlag || lastMovement.movementDirection === 'OUT') &&
      lastMovement.movementTypeCode !== 'ADM';
};

let reportName = 'AO';
let extractDate = moment('2016-01-01');
let builder = AOModel.build(extractDate);
let entryChecker = isAOEntry;

// start of routine

let now = moment();
let ep = `./.extracts/reports/${reportName}/${extractDate.format('YYYYMMDD')}.json`;
let ws = fs.createWriteStream(ep, 'utf8');
let size = 100;

let rq;
let isFirst = true;
let jobDone = false;
let listComplete = false;
let totalEntries = 0;
let entries = 0;

let getContent = (response) => response._embedded.offenders;

let setupQueue = (batch, totalPages) => {
  let sets = [];
  for (let i = 0; i < totalPages; i++) {
    sets.push({ type: 'list', page: i + 1, size: batch.size });
  }

  rq.push(sets);

  setupQueue = () => {};
};

let startJob = () => {
  setInterval(() => {
    log.info(Object.assign({}, rq.report(), { start: now }), `${reportName} RequestQueue ON PROGRESS`);

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

  log.info(Object.assign({}, rq.report(), { start: now, end: new Date() }), `${reportName} RequestQueue ON COMPLETE`);

  jobDone = true;
};

rq = new RequestQueue((batch, done) => {
    log.info({ batch }, `${reportName} RequestQueue ON DATA`);

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

          if (response.page.number === response.page.totalPages - 1) {
            listComplete = true;

            if (totalEntries === 0) {
              completeJob();
            }
          }

          done();
        })
        .catch((err) => {
          log.error(err, `${reportName} RequestQueue ON ERROR`);
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
            log.error(err, `${reportName} RequestQueue ON ERROR`);
            done();
          });
      }
  }, { concurrency: 10 });

startJob();
