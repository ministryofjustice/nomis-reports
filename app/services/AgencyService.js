const AgencyRepository = require('../repositories/AgencyRepository');
const CachingRepository = require('../helpers/CachingRepository');

function AgencyService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(AgencyRepository, config);
}

AgencyService.prototype.list = function (query) {
  return this.repository.list(query);
};

AgencyService.prototype.getDetails = function (agencyId) {
  return this.repository.getDetails(agencyId);
};

module.exports = AgencyService;
