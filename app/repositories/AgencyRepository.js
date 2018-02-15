const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function AgencyRepository(config, agent) {
  this.config = Object.assign({ limit: 10000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    list: this.agent.get(`${this.config.elite2.apiUrl}/agencies`),
    getDetails: this.agent.get(`${this.config.elite2.apiUrl}/agencies/:agencyId`),
    listLocations: this.agent.get(`${this.config.elite2.apiUrl}/agencies/:agencyId/locations`),
    getContactDetails: this.agent.get(`${this.config.elite2.apiUrl}/agencies/prison/:agencyId`),
  };
}

AgencyRepository.prototype.list = function (query, pageOffset = 0, pageSize) {
  return this.requests.list({ query })
    .set('Page-Limit', pageSize || this.config.limit)
    .set('Page-Offset', pageOffset * (pageSize || this.config.limit))
    .then(helpers.handleResponse([]));
};

AgencyRepository.prototype.getDetails = function (agencyId) {
  return this.requests.getDetails({ agencyId }).then(helpers.handleResponse());
};

AgencyRepository.prototype.listLocations = function (agencyId, query) {
  return this.requests.listLocations({ agencyId }, query).then(helpers.handleResponse([]));
};

AgencyRepository.prototype.getContactDetails = function (agencyId) {
  return this.requests.getContactDetails({ agencyId }).then(helpers.handleResponse());
};

module.exports = AgencyRepository;
