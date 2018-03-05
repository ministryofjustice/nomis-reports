const RequestQueue = require('../helpers/RequestQueue.js');

const log = require('../../server/log');

const formatDate = (d) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}T${d.getHours()}:${('00' + d.getMinutes()).substr(-2)}`;

function ExtractorAgent(opts) {
  this.type = opts.type;
  this.concurrency = opts.concurrency;
  this.interval;
}

ExtractorAgent.prototype.run = function(opts, cb) {
  let extractDate = formatDate(new Date());
  let location = `extracts/${this.type}/${extractDate}`;
  let extractDetails = { extractDate, location: '/' + location };

  log.info(extractDetails, 'createExtract BEGIN');

  let queue = new RequestQueue({ concurrency: this.concurrency });

  this.interval = this.interval || setInterval(() => {
    log.info(queue.report(), 'ExtractorAgent run PROGRESS');
  }, 10000);

  queue.onData(opts.detail);
  queue.onComplete((data) => {
    clearInterval(this.interval);

    log.info(extractDetails, 'createExtract SUCCESS');

    cb(data);
  });

  let callNextList = function(pageOffset = 0) {
    return opts.list(pageOffset)
      .then(ids => {
        if (ids && ids.length > 0) {
          log.info(Object.assign(extractDetails, { pageOffset }), 'createExtract PROGRESS');

          queue.push(ids);

          return callNextList(pageOffset + 1);
        }
      })
      .catch((error) => {
        if (error.status === 502) {
          log.info(Object.assign(extractDetails, { pageOffset }), 'createExtract RETRY');
          return callNextList(pageOffset);
        }

        log.error(error, Object.assign(extractDetails, { pageOffset }), 'createExtract ERROR');
      });
  };

  callNextList(0).then(() => {
    log.info(extractDetails, 'createExtract FINALIZE');

    queue.finalize();
  });

  return extractDetails;
};

module.exports = ExtractorAgent;
