const apiAgent = require('../helpers/apiAgent');

const helpers = require('../helpers');

function OffenderRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = apiAgent(agent, [
      (request) => {
        request.set('Authorization', `Bearer ${this.config.reports.bearerToken}`);

        return request;
      }
  ], this.config.reports);

  let root = this.config.reports.apiUrl;

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
