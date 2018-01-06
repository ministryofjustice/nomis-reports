const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function AgencyRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    list: this.agent.get(`${this.config.elite2.apiUrl}/agencies`),
    getDetails: this.agent.get(`${this.config.elite2.apiUrl}/agencies/:agencyId`),
  };
}

AgencyRepository.prototype.list = function (query) {
  return this.requests.list({ query }).set('Page-Limit', this.config.limit).then(helpers.handleResponse([]));
};

AgencyRepository.prototype.getDetails = function (agencyId) {
  return this.requests.getDetails({ agencyId }).then(helpers.handleResponse());
};

module.exports = AgencyRepository;