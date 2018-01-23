const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');
const CachingRepository = require('../helpers/CachingRepository');

function CustodyStatusService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(CustodyStatusRepository, config);
}

CustodyStatusService.prototype.list = function (query) {
  return this.repository.list(query);
};

CustodyStatusService.prototype.getStatus = function (nomsId, query) {
  return this.repository.getStatus(nomsId, query);
};

module.exports = CustodyStatusService;
