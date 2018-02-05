const nomisApiAgent = require('../helpers/nomisApiAgent');

const helpers = require('../helpers');

function OffenderRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = nomisApiAgent(agent, undefined, this.config.nomis);

  let root = this.config.nomis.apiUrl;

  this.requests = {
    fetchEvents: this.agent.get(`${root}/offenders/events`),
    getDetails: this.agent.get(`${root}/offenders/:nomsId`),
    getLocation: this.agent.get(`${root}/offenders/:nomsId/location`),
    getImage: this.agent.get(`${root}/offenders/:nomsId/image`),
    getCharges: this.agent.get(`${root}/offenders/:nomsId/charges`),
    getPssDetail: this.agent.get(`${root}/offenders/:nomsId/pss_detail`),
  };
}

OffenderRepository.prototype.fetchEvents = function (query) {
  return this.requests.fetchEvents(query).set('Page-Limit', this.config.limit).then(helpers.handleResponse([]));
};

OffenderRepository.prototype.getDetails = function (nomsId) {
  return this.requests.getDetails({ nomsId }).then(helpers.handleResponse());
};

OffenderRepository.prototype.getLocation = function (nomsId) {
  return this.requests.getLocation({ nomsId }).then(helpers.handleResponse());
};

OffenderRepository.prototype.getImage = function (nomsId) {
  return this.requests.getImage({ nomsId }).then(helpers.handleResponse());
};

OffenderRepository.prototype.getCharges = function (nomsId) {
  return this.requests.getCharges({ nomsId }).then(helpers.handleResponse());
};

OffenderRepository.prototype.getPssDetail = function (nomsId) {
  return this.requests.getPssDetail({ nomsId }).then(helpers.handleResponse());
};

module.exports = OffenderRepository;
