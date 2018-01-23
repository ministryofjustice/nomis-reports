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

AgencyService.prototype.listLocations = function (agencyId, query) {
  return this.repository.listLocations(agencyId, query);
};

AgencyService.prototype.listContactDetails = function (query) {
  return this.repository.listContactDetails(query);
};

AgencyService.prototype.getContactDetails = function (agencyId) {
  return this.repository.getContactDetails(agencyId);
};

module.exports = AgencyService;
