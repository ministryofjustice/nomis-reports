const nomisApiAgent = require('../helpers/nomisApiAgent');

const helpers = require('../helpers');

function PrisonRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = nomisApiAgent(agent, undefined, this.config.nomis);

  this.requests = {
    liveRoll: this.agent.get(`${this.config.nomis.apiUrl}/prison/:prisonId/live_roll`),
  };
}

PrisonRepository.prototype.liveRoll = function (prisonId, query, pageOffset = 0, pageSize) {
  return this.requests.liveRoll({ prisonId }, query)
    .set('Page-Limit', pageSize || this.config.limit)
    .set('Page-Offset', pageOffset * (pageSize || this.config.limit))
    .then(helpers.handleResponse([]));
};

module.exports = PrisonRepository;
