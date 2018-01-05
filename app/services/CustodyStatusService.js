const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');

function CustodyStatusService(config, repo) {
  this.config = config;
  this.repository = repo || new CustodyStatusRepository(config);
}

CustodyStatusService.prototype.list = function (query) {
  return this.repository.list(query);
};

CustodyStatusService.prototype.getDetails = function (nomsId) {
  return this.repository.getDetails(nomsId);
};

module.exports = CustodyStatusService;
