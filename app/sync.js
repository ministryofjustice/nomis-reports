const moment = require('moment');

const RequestQueue = require('./helpers/RequestQueue');
const ReportsService = require('./services/ReportsService');

const AOModel = require('./models/AO');
const CDEModel = require('./models/CDE');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  reports: new ReportsService(config)
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

      return movementDate.diff(extractDate.subtract(7, 'days')) >= 0;
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

    return movementDate.diff(extractDate.subtract(7, 'days')) >= 0;
  }
};

const processAOJob = (job, complete) =>
  services.reports.getDetails(job.offenderId)
    .then(AOModel.build(moment()))
    .then((data) => {
      log.info({ job, data }, `sync ON AO RESPONSE`);
      complete();
    })
    .catch((err) => {
      log.error(err, `sync ON AO ERROR`);
      complete();
    });

const processCDEJob = (job, complete) =>
  services.reports.getDetails(job.offenderId)
    .then(CDEModel.build(moment()))
    .then((data) => {
      log.info({ job, data }, `sync ON CDE RESPONSE`);
      complete();
    })
    .catch((err) => {
      log.error(err, `sync ON CDE ERROR`);
      complete();
    });

let rq = new RequestQueue((job, done) => {
    log.info({ offenderId: job.offenderId }, `sync ON DATA`);

    let complete = () => { complete = () => done(); };

    isAOEntry(job, moment()) ? processAOJob(job, complete) : complete();
    isCDEEntry(job, moment()) ? processCDEJob(job, complete) : complete();
  }, { concurrency: 10 });

let getContent = (response) => response._embedded.externalMovementList;

const getEvents = function getEvents(from, to) {
  log.debug({ from, to }, 'sync REQUESTING EVENTS');

  // TODO: work off case notes ??
  services.reports.listMovements({ from, to }, 0, 1000)
    .then((data) => {
      log.info({ from, to, updates: data.page.size }, 'sync RECEIVED EVENTS');

      getContent(data).forEach((row) => {
        let nextTS = moment(row.movementDateTime);
        if (from < nextTS) {
          from = nextTS;
        }

        log.info({ from, to, offenderId: row.offenderId }, 'sync PUSH EVENT');

        rq.push(row);

        setTimeout(() => getEvents(from, to), data.length > 0 ? 0 : 1000);
      });
    })
    .catch((error) => {
      log.error(error, 'sync ON ERROR');
    });
};

let to = moment('2016-01-01');
let from = to.subtract(1, 'minutes');
getEvents(from.format());
