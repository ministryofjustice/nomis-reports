const custodyApiAgent = require('../helpers/custodyApiAgent');

const helpers = require('../helpers');

function OffenderRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = custodyApiAgent(agent, undefined, this.config.custody);

  let root = this.config.custody.apiUrl;

  this.requests = {
    listOffences: this.agent.get(`${root}/offences`),
    getOffence: this.agent.get(`${root}/offences/offenceId/:offenceId`),
  };
}

OffenderRepository.prototype.listOffences = function (query, page, size) {
  return this.requests.listOffences(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

OffenderRepository.prototype.getOffence = function (offenderId) {
  return this.requests.getOffence({ offenderId }).then(helpers.handleResponse());
};

module.exports = OffenderRepository;
