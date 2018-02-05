const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');
const CachingRepository = require('../helpers/CachingRepository');
const RetryingRepository = require('../helpers/RetryingRepository');

const batchRequest = (func, opts, out, batch) => {
let page = ++opts.page;

return func(page)
  .then((data) => {
    if (data.length > 0) {
      data.forEach((x) => out.add(x));

      return batchRequest(func, opts, out, batch);
    }
  })
  .catch((err) => {
    console.log('batchRequest', 'ERROR', { page, batch });
    delete err.text;
    console.log(err);

    if (err.code === 'ENOTFOUND') {
      // network connection error abort
      throw err;
    }

    return batchRequest(func, opts, out, batch);
  });
};

const batchProcess = (func, size) => {
let opts = { page: 0 };
let out = new Set();

let batch = [];
for (let i = 0; i < size; i++) {
  batch.push(batchRequest(func, opts, out, i));
}

return Promise.all(batch)
  .catch(() => console.log('THERE WERE ERRORS'))
  .then(() => {
    console.log('DONE', out.size);

    return Array.from(out);
  });
};

function CustodyStatusService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(new RetryingRepository(new CustodyStatusRepository(config)));
}

CustodyStatusService.prototype.all = function (query) {
  return batchProcess((pageOffset = 0) => this.list(query || {}, pageOffset), 20);
};

CustodyStatusService.prototype.list2 = function (query, pageOffset) {
  return this.repository.list(query, pageOffset);
  /*
    .then((x) => x.map((x) => ({
      id: `/offenders/${x.bookingId}`,
      custodyStatusCode: x.custodyStatusCode,
    })));
  */
};

CustodyStatusService.prototype.list = function (query, pageOffset) {
  return this.repository.list(query, pageOffset);
};

CustodyStatusService.prototype.getStatus = function (nomsId, query) {
  return this.repository.getStatus(nomsId, query);
};

module.exports = CustodyStatusService;
