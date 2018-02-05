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

AgencyRepository.prototype.list = function (query, pageOffset) {
  return this.requests.list(query)
    .set('Page-Limit', this.config.limit)
    .set('Page-Offset', (pageOffset || 0) * this.config.limit)
    .then(helpers.handleResponse([]))
    .catch((err) => {
      console.log(new Error(err));
      return [];
    });
};

AgencyRepository.prototype.getDetails = function (agencyId) {
  return this.requests.getDetails({ agencyId }).then(helpers.handleResponse())
    .catch((err) => {
      console.log(new Error(err));
      return;
    });
};

AgencyRepository.prototype.listLocations = function (agencyId, query) {
  return this.requests.listLocations({ agencyId }, query).then(helpers.handleResponse([]))
    .catch((err) => {
      console.log(new Error(err));
      return [];
    });
};

AgencyRepository.prototype.getContactDetails = function (agencyId) {
  return this.requests.getContactDetails({ agencyId }).then(helpers.handleResponse())
    .catch((err) => {
      console.log(new Error(err));
      return;
    });
};

module.exports = AgencyRepository;
