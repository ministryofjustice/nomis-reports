const RequestQueue = require('../helpers/RequestQueue.js');

const log = require('../../server/log');

const formatDate = (d) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}T${d.getHours()}:${('00' + d.getMinutes()).substr(-2)}`;

function ExtractorAgent(opts) {
  this.type = opts.type;
  this.concurrency = opts.concurrency;
}

ExtractorAgent.prototype.run = function(opts, cb) {
  let extractDate = formatDate(new Date());
  let location = `extracts/${this.type}/${extractDate}`;
  let extractDetails = { extractDate, location: '/' + location };

  log.info(extractDetails, 'createExtract BEGIN');

  let queue = new RequestQueue({ concurrency: this.concurrency });

  let interval = setInterval(() => {
    log.info(queue.report(), 'ExtractorAgent run PROGRESS');
  }, 10000);

  queue.onData(opts.detail);
  queue.onComplete((error, data) => {
    clearInterval(interval);

    if (error) {
      return log.error(error, 'createExtract ERROR');
    }

    cb(data);
  });

  opts.list().then(ids => queue.push(ids).finalize());

  return extractDetails;
};

module.exports = ExtractorAgent;
