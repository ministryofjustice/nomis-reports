const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');
const CachingRepository = require('../helpers/CachingRepository');

function CustodyStatusService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(CustodyStatusRepository, config);
}

CustodyStatusService.prototype.list = function (query) {
  return this.repository.list(query);
};

CustodyStatusService.prototype.getDetails = function (nomsId) {
  return this.repository.getDetails(nomsId);
};

module.exports = CustodyStatusService;
