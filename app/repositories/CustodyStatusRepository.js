const eliteApiAgent = require('../helpers/eliteApiAgent');

function CustodyStatusRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    list: this.agent.get(`${this.config.elite2.apiUrl}/custody-statuses`),
    getDetails: this.agent.get(`${this.config.elite2.apiUrl}/custody-statuses/:nomsId`),
  };
}

CustodyStatusRepository.prototype.list = function (query) {
  return this.requests.list({ query }).set('Page-Limit', this.config.limit)
    .then((response) => response.status >= 200 && response.status <= 299 ? response.body : []);
};

CustodyStatusRepository.prototype.getDetails = function (nomsId) {
  return this.requests.getDetails({ nomsId })
    .then((response) => response.status >= 200 && response.status <= 299 ? response.body : undefined);
};

module.exports = CustodyStatusRepository;
