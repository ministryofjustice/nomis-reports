const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');
const CachingRepository = require('../helpers/CachingRepository');
const RetryingRepository = require('../helpers/RetryingRepository');

function CustodyStatusService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(new RetryingRepository(new CustodyStatusRepository(config)));
}

const buildList = (repository, query, pageOffset = 0, ids = [], ids2 = []) => {
  return repository.list(query, pageOffset)
    .then((items = []) => {
      items.forEach((x) => {
        if (!~ids.indexOf(x)) {
          ids.push(x);
        }
      });

      ids2 = ids2.concat(items);

      console.log('Custody Status counter', items.length, ids.length, ids2.length);

      return (items.length > 0) ? buildList(repository, query, ++pageOffset, ids, ids2) : ids;
    });
};

CustodyStatusService.prototype.all = function (query) {
  return buildList(this, query);
};

CustodyStatusService.prototype.list2 = function (query, pageOffset) {
  return this.repository.list(query, pageOffset)
    .then((x) => x.map((x) => ({
      id: `/offenders/${x.bookingId}`,
    })));
};

CustodyStatusService.prototype.list = function (query) {
  return this.repository.list(query);
};

CustodyStatusService.prototype.getStatus = function (nomsId, query) {
  return this.repository.getStatus(nomsId, query);
};

module.exports = CustodyStatusService;
