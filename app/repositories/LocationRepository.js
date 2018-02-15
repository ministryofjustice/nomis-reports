const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function LocationRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    list: this.agent.get(`${this.config.elite2.apiUrl}/locations`),
    getDetails: this.agent.get(`${this.config.elite2.apiUrl}/locations/:locationId`),
    listInmates: this.agent.get(`${this.config.elite2.apiUrl}/locations/:locationId/inmates`),
  };
}

LocationRepository.prototype.list = function (query, pageOffset = 0, pageSize) {
  return this.requests.list({ query })
    .set('Page-Limit', pageSize || this.config.limit)
    .set('Page-Offset', pageOffset * (pageSize || this.config.limit))
    .then(helpers.handleResponse([]));
};

LocationRepository.prototype.getDetails = function (locationId) {
  return this.requests.getDetails({ locationId }).then(helpers.handleResponse());
};

LocationRepository.prototype.listInmates = function (locationId, query, pageOffset = 0, pageSize) {
  return this.requests.listInmates({ locationId }, query)
    .set('Page-Limit', pageSize || this.config.limit)
    .set('Page-Offset', pageOffset * (pageSize || this.config.limit))
    .then(helpers.handleResponse([]));
};

module.exports = LocationRepository;
