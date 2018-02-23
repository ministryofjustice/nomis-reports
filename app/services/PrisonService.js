const ProcessAgent = require('../helpers/MainProcessAgent');

function LocationService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

LocationService.prototype.liveRoll = function (prisonId, query) {
  return this.agent.request('prison', 'liveRoll', prisonId, query);
};

module.exports = LocationService;
