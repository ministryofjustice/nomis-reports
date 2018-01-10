const PrisonRepository = require('../repositories/PrisonRepository');
const CachingRepository = require('../helpers/CachingRepository');

function LocationService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(PrisonRepository, config);
}

LocationService.prototype.liveRoll = function (prisonId, query) {
  return this.repository.liveRoll(prisonId, query);
};

module.exports = LocationService;
