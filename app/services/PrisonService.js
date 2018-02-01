const PrisonRepository = require('../repositories/PrisonRepository');
const CachingRepository = require('../helpers/CachingRepository');
const RetryingRepository = require('../helpers/RetryingRepository');

function LocationService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(PrisonRepository, config);
  this.repository = repo || new CachingRepository(new RetryingRepository(new PrisonRepository(config)));
}

LocationService.prototype.liveRoll = function (prisonId, query) {
  return this.repository.liveRoll(prisonId, query);
};

module.exports = LocationService;
