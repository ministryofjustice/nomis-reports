const ChildProcessAgent = require('../helpers/ChildProcessAgent');
const CachingRepository = require('../helpers/CachingRepository');

function OffenderService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new CachingRepository(new ChildProcessAgent(this.config));
}

OffenderService.prototype.getDetails = function (nomsId) {
  return this.agent.request('offender', 'getDetails', nomsId);
};

OffenderService.prototype.fetchCaseNoteEvents = function(query) {
  return this.agent.request('offender', 'fetchCaseNoteEvents', query);
};

OffenderService.prototype.fetchEvents = function (query) {
  return this.agent.request('offender', 'fetchEvents', query);
};

OffenderService.prototype.getLocation = function (nomsId) {
  return this.agent.request('offender', 'getLocation', nomsId);
};

OffenderService.prototype.getImage = function (nomsId) {
  return this.agent.request('offender', 'getImage', nomsId);
};

OffenderService.prototype.getCharges = function (nomsId) {
  return this.agent.request('offender', 'getCharges', nomsId);
};

OffenderService.prototype.getPssDetail = function (nomsId) {
  return this.agent.request('offender', 'getPssDetail', nomsId);
};

module.exports = OffenderService;
