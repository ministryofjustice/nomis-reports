const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function CustodyStatusRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    list: this.agent.get(`${this.config.elite2.apiUrl}/custody-statuses`),
    getStatus: this.agent.get(`${this.config.elite2.apiUrl}/custody-statuses/:nomsId`),
  };
}

CustodyStatusRepository.prototype.list = function (query) {
  return this.requests.list(query).then(helpers.handleResponse([]));
};

CustodyStatusRepository.prototype.getStatus = function (nomsId, query) {
  return this.requests.getStatus({ nomsId }, query).then(helpers.handleResponse());
};

module.exports = CustodyStatusRepository;
