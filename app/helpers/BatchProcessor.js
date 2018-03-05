const log = require('../../server/log');

const batchRequest = (func, opts, out, batch) => {
  let page = ++opts.page;

  return func(page)
    .then((data) => {
      if (data && data.length > 0) {
        log.debug({ batch, page, size: data.length }, 'BatchProcessor batchRequest SUCCESS');

        data.forEach((x) => out.add(x));

        return batchRequest(func, opts, out, batch);
      }
    })
    .catch((error) => {
      log.error(error, {batch, page}, 'BatchProcessor batchRequest ERROR');

      return batchRequest(func, opts, out, batch);
    });
};

function BatchProcessor(config) {
  this.concurrency = config.concurrency;
}

BatchProcessor.prototype.run = function(func) {
  let opts = { page: 0 };
  let out = new Set();

  let batch = [];
  for (let i = 0; i < this.concurrency; i++) {
    batch.push(batchRequest(func, opts, out, i));
  }

  return Promise.all(batch)
    .catch(() => {
      log.debug({ size: out.size }, 'BatchProcessor run DONE, BUT WITH ERRORS');

      return Promise.resolve(Array.from(out));
    })
    .then(() => {
      log.info({ size: out.size}, 'BatchProcessor run DONE');

      return Promise.resolve(Array.from(out));
    });
};

module.exports = BatchProcessor;
