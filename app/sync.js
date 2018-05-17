const ReportsService = require('./services/ReportsService');
const RequestQueue = require('./helpers/RequestQueue');

const log = require('../server/log');
const config = require('../server/config');

const services = {
  reports: new ReportsService(config)
};

let rq = new RequestQueue((job, done) => {
    log.info({ offenderId: job.offenderId }, `RequestQueue ON DATA`);

    services.reports.getAODetails(job.offenderId)
      .then((data) => {
        log.info({ job, data }, `RequestQueue ON RESPONSE`);

        done();
      })
      .catch((err) => {
        log.error(err, `RequestQueue ON ERROR`);
        done();
      });
  }, { concurrency: 10 });

const getEvents = function getEvents(from, to) {
  from = from || new Date((new Date()).setTime(new Date().getTime() - 1000));
  to = to || new Date(from.setTime(from.getTime()));

  log.debug({ from }, 'sync REQUESTING EVENTS');

  // TODO: work off case notes ??
  services.reports.listMovements({ from }, 0, 1000)
    .then((data) => {
      log.info({ from, updates: data.page.size }, 'sync RECEIVED EVENTS');

      data._embedded.externalMovementList
        .forEach((row) => {
          let nextTS = new Date(row.movementDateTime);
          if (from < nextTS) {
            from = nextTS;
          }

          log.info({ from, offenderId: row.offenderId }, 'sync PUSH EVENT');

          rq.push(row);

          setTimeout(() => getEvents(from, to), data.length > 0 ? 0 : 1000);
        });
    })
    .catch((error) => {
      log.error(error, 'sync ON ERROR');
    });
};

getEvents();
