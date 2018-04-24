const ProcessAgent = require('../helpers/MainProcessAgent');

function OffenceService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

OffenceService.prototype.listOffences = function (query, pageOffset, pageSize) {
  return this.agent.request('offence', 'listOffences', query, pageOffset, pageSize);
};

OffenceService.prototype.getOffence = function (OffenceId) {
  this.agent.request('offence', 'getOffence', OffenceId);
};

module.exports = OffenceService;
