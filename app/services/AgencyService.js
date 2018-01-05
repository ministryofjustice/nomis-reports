const AgencyRepository = require('../repositories/AgencyRepository');

function AgencyService(config, repo) {
  this.config = config;
  this.repository = repo || new AgencyRepository(config);
}

AgencyService.prototype.list = function (query) {
  return this.repository.list(query);
};

AgencyService.prototype.getDetails = function (agencyId) {
  return this.repository.getDetails(agencyId);
};

module.exports = AgencyService;
