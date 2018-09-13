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

function SyncData(filepath) {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, "{}");
  }

  this.filepath = filepath;

  this.load();
}

SyncData.load = function createSyncData(filepath) {
  return new SyncData(filepath);
};

SyncData.prototype.load = function loadSyncData() {
  function jsonReviver(key, value) {
    if (typeof value === "string") {
      let m = moment(value, moment.ISO_8601);
      if (m.isValid()) {
        return m;
      }
    }

    return value;
  };

  this.data = JSON.parse(fs.readFileSync(this.filepath, 'utf8'), jsonReviver);
};

SyncData.prototype.get = function getLastSync(property) {
  return this.data[property].clone();
};

SyncData.prototype.set = function getLastSync(property, value) {
  let m = moment(value);
  if (this.data[property].diff(m) < 0) {
    this.data[property] = m;

    fs.writeFileSync(this.filepath, JSON.stringify(this.data));
  }

  return this;
};

const writeEntry = (offenderId, complete) => (data) => {
  log.info({ offenderId }, `CDE SYNC ON WRITE`);

  let partialExtract = `./.extracts/reports/CDE/${moment(data.extractDate).format('YYYY-MM-DD')}-partial.json`;
  let partial = [];

  if (fs.existsSync(partialExtract)) {
    partial = JSON.parse(fs.readFileSync(partialExtract, 'utf8'))
      .filter(x => x.nomis_id_f4 !== data.nomis_id_f4);
  }

  partial.push(data);

  fs.writeFileSync(partialExtract, JSON.stringify(partial, null, '  '), 'utf8');
  complete();
};

let cdeProcessedIds = [];
const cdeProcessorJobQueue = new RequestQueue((job, done) => {
  log.info({ offenderId: job.offenderId }, `CDE SYNC ON JOB`);

  services.reports.getDetails(job.offenderId)
    .then(CDEModel.build(moment()))
    .then(writeEntry(job.offenderId, () => done()))
    .then(() => {
      let index = cdeProcessedIds.indexOf(job.offenderId);
      if (index > -1) {
        cdeProcessedIds = cdeProcessedIds.splice(index, 1);
      }
    })
    .catch((err) => {
      log.error(err, `CDE SYNC ON ERROR`);
      done();
    });
}, { concurrency: 10 });

const getContent = prop => response => (response._embedded || {})[prop] || [];

const parseRows = (syncData, listProp, timestampProperty) => rows => {
  if (rows.length === 0) {
    log.info({ listProp, updates: 0 }, 'CDE SYNC ON NO EVENTS');
    return rows;
  }

  log.info({ listProp, updates: rows.length }, 'CDE SYNC ON RECEIVE EVENTS');

  rows.forEach((row) => {
    syncData.set(listProp, moment(row[timestampProperty]));

    if (!~cdeProcessedIds.indexOf(row.offenderId)) {
      cdeProcessedIds.push(row.offenderId);

      log.info({ listProp, offenderId: row.offenderId }, 'CDE SYNC ON PUSH EVENT');
      cdeProcessorJobQueue.push({offenderId: row.offenderId || row.rootOffenderId });
    }
  });

  return rows;
};

const scheduleNextSync = (syncData, interval, pageSize, listProp) => rows => {
  let waitTime = 0;

  if (rows.length === 0 || rows.length < pageSize) {
    syncData.set(listProp, moment());
    waitTime = interval;
  }

  return waitTime;
};

const sync = (syncData, interval, pageSize, api, listProp, timestampProperty) => {
  let lastrun = syncData.get(listProp);

  log.info({ listProp, lastrun }, 'CDE SYNC ON CALL');

  services.reports[api]
    .apply(services.reports, [{ from: lastrun.format('YYYY-MM-DDTHH:mm:ss') }, 0, pageSize])
    .then(getContent(listProp))
    .then(parseRows(syncData, listProp, timestampProperty))
    .then(scheduleNextSync(syncData, interval, pageSize, listProp))
    .catch((error) => {
      log.error({ listProp, error }, 'CDE SYNC ON ERROR');
      return Promise.resolve(interval);
    })
    .then(waitTime => {
      log.info({ listProp, lastrun, waitTime }, 'CDE SYNC ON SET TIMEOUT');
      setTimeout(() => sync(syncData, interval, pageSize, api, listProp, timestampProperty), waitTime);
    });
};

// process
log.info('CDE SYNC ON START');

config.sync = {
  interval: 1000 * 10,
  pageSize: 1000,
  syncFile: './.extracts/last-sync.json',
};

sync(SyncData.load(config.sync.syncFile), config.sync.interval, config.sync.pageSize, 'listEvents', 'offenderEventList', 'eventDatetime');
