const apiAgent = require('../helpers/apiAgent');

const helpers = require('../helpers');

function ReportsRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = apiAgent(agent, [
      (request) => {
        request.set('Authorization', `Bearer ${this.config.reports.bearerToken}`);

        return request;
      }
  ], this.config.reports);

  let root = this.config.reports.apiUrl;

  this.requests = {
    listOffenders: this.agent.get(`${root}/offenders`),
    getOffender: this.agent.get(`${root}/offenders/offenderId/:offenderId`),
    getOffenderAddresses: this.agent.get(`${root}/offenders/offenderId/:offenderId/addresses`),
    getOffenderCharges: this.agent.get(`${root}/offenders/offenderId/:offenderId/charges`),
    getOffenderContactPersons: this.agent.get(`${root}/offenders/offenderId/:offenderId/contactPersons`),
    getOffenderEmployments: this.agent.get(`${root}/offenders/offenderId/:offenderId/employments`),
    getOffenderMovements: this.agent.get(`${root}/offenders/offenderId/:offenderId/movements`),
    getOffenderSentences: this.agent.get(`${root}/offenders/offenderId/:offenderId/sentences`),
    getOffenderAssessments: this.agent.get(`${root}/offenders/offenderId/:offenderId/assessments`),
    getOffenderHealthProblems: this.agent.get(`${root}/offenders/offenderId/:offenderId/healthProblems`),
    getOffenderImprisonmentStatuses: this.agent.get(`${root}/offenders/offenderId/:offenderId/imprisonmentStatuses`),
    getOffenderReleaseDetails: this.agent.get(`${root}/offenders/offenderId/:offenderId/releaseDetails`),
    getOffenderSentenceCalculations: this.agent.get(`${root}/offenders/offenderId/:offenderId/sentenceCalculations`),
    getOffenderPhysicals: this.agent.get(`${root}/offenders/offenderId/:offenderId/physicals`),
    getOffenderIEPs: this.agent.get(`${root}/offenders/offenderId/:offenderId/ieps`),
    listAddresses: this.agent.get(`${root}/addresses`),
    listCharges: this.agent.get(`${root}/charges`),
    listMovements: this.agent.get(`${root}/movements`),
    listSentences: this.agent.get(`${root}/sentences`),
  };
}

ReportsRepository.prototype.listOffenders = function (query, page, size) {
  return this.requests.listOffenders(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffender = function (offenderId) {
  return this.requests.getOffender({ offenderId }).then(helpers.handleResponse());
};

ReportsRepository.prototype.getOffenderAddresses = function (offenderId) {
  return this.requests.getOffenderAddresses({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderCharges = function (offenderId) {
  return this.requests.getOffenderCharges({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderContactPersons = function (offenderId) {
  return this.requests.getOffenderContactPersons({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderEmployments = function (offenderId) {
  return this.requests.getOffenderEmployments({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderMovements = function (offenderId) {
  return this.requests.getOffenderMovements({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderSentences = function (offenderId) {
  return this.requests.getOffenderSentences({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderAssessments = function (offenderId) {
  return this.requests.getOffenderAssessments({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderHealthProblems = function (offenderId) {
  return this.requests.getOffenderHealthProblems({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderImprisonmentStatuses = function (offenderId) {
  return this.requests.getOffenderImprisonmentStatuses({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderReleaseDetails = function (offenderId) {
  return this.requests.getOffenderReleaseDetails({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderSentenceCalculations = function (offenderId) {
  return this.requests.getOffenderSentenceCalculations({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderPhysicals = function (offenderId) {
  return this.requests.getOffenderPhysicals({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderIEPs = function (offenderId) {
  return this.requests.getOffenderIEPs({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listAddresses = function (query, page, size) {
  return this.requests.listAddresses(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listCharges = function (query, page, size) {
  return this.requests.listCharges(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listMovements = function (query, page, size) {
  return this.requests.listMovements(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listSentences = function (query, page, size) {
  return this.requests.listSentences(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

module.exports = ReportsRepository;
