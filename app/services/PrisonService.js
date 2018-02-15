const ChildProcessAgent = require('../helpers/ChildProcessAgent');
const CachingRepository = require('../helpers/CachingRepository');

function LocationService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new CachingRepository(new ChildProcessAgent(this.config));
}

LocationService.prototype.liveRoll = function (prisonId, query) {
  return this.agent.request('prison', 'liveRoll', prisonId, query);
};

module.exports = LocationService;
