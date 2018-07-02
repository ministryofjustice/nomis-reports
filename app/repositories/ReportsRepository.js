const custodyApiAgent = require('../helpers/custodyApiAgent');

const helpers = require('../helpers');

function ReportsRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = custodyApiAgent(agent, undefined, this.config.custody);

  let root = this.config.custody.apiUrl;

  this.requests = {
    listAddresses: this.agent.get(`${root}/addresses`),
    listAlerts: this.agent.get(`${root}/alerts`),
    listAssessments: this.agent.get(`${root}/assessments`),
    listCharges: this.agent.get(`${root}/charges`),
    listHealthProblems: this.agent.get(`${root}/healthProblems`),
    listImprisonmentStatuses: this.agent.get(`${root}/imprisonmentStatuses`),
    listMovements: this.agent.get(`${root}/movements`),
    listOffences: this.agent.get(`${root}/offences`),
    listOffenders: this.agent.get(`${root}/offenders`),
    listReleaseDetails: this.agent.get(`${root}/releaseDetails`),
    listSentenceCalculations: this.agent.get(`${root}/sentenceCalculations`),
    listSentences: this.agent.get(`${root}/sentences`),

    getOffender: this.agent.get(`${root}/offenders/offenderId/:offenderId`),
    getOffenderByNomsId: this.agent.get(`${root}/offenders/nomsId/:nomsId`),
    getOffenderAddresses: this.agent.get(`${root}/offenders/offenderId/:offenderId/addresses`),
    getOffenderAlerts: this.agent.get(`${root}/offenders/offenderId/:offenderId/alerts`),
    getOffenderAssessments: this.agent.get(`${root}/offenders/offenderId/:offenderId/assessments`),
    getOffenderCharges: this.agent.get(`${root}/offenders/offenderId/:offenderId/charges`),
    getOffenderContactPersons: this.agent.get(`${root}/offenders/offenderId/:offenderId/contactPersons`),
    getOffenderCourtEvents: this.agent.get(`${root}/offenders/offenderId/:offenderId/courtEvents`),
    getOffenderDiaryDetails: this.agent.get(`${root}/offenders/offenderId/:offenderId/diaryDetails`),
    getOffenderEmployments: this.agent.get(`${root}/offenders/offenderId/:offenderId/employments`),
    getOffenderHealthProblems: this.agent.get(`${root}/offenders/offenderId/:offenderId/healthProblems`),
    getOffenderIEPs: this.agent.get(`${root}/offenders/offenderId/:offenderId/ieps`),
    getOffenderImprisonmentStatuses: this.agent.get(`${root}/offenders/offenderId/:offenderId/imprisonmentStatuses`),
    getOffenderMovements: this.agent.get(`${root}/offenders/offenderId/:offenderId/movements`),
    getOffenderPhysicals: this.agent.get(`${root}/offenders/offenderId/:offenderId/physicals`),
    getOffenderRehabDecisions: this.agent.get(`${root}/offenders/offenderId/:offenderId/rehabDecisions`),
    getOffenderReleaseDetails: this.agent.get(`${root}/offenders/offenderId/:offenderId/releaseDetails`),
    getOffenderSentenceCalculations: this.agent.get(`${root}/offenders/offenderId/:offenderId/sentenceCalculations`),
    getOffenderSentences: this.agent.get(`${root}/offenders/offenderId/:offenderId/sentences`),
  };
}

ReportsRepository.prototype.listAddresses = function (query, page, size) {
  return this.requests.listAddresses(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listAlerts = function (query, page, size) {
  return this.requests.listAlerts(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listAssessments = function (query, page, size) {
  return this.requests.listAssessments(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listCharges = function (query, page, size) {
  return this.requests.listCharges(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listHealthProblems = function (query, page, size) {
  return this.requests.listHealthProblems(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listImprisonmentStatuses = function (query, page, size) {
  return this.requests.listImprisonmentStatuses(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listMovements = function (query, page, size) {
  return this.requests.listMovements(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listOffences = function (query, page, size) {
  return this.requests.listOffences(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listOffenders = function (query, page, size) {
  return this.requests.listOffenders(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listReleaseDetails = function (query, page, size) {
  return this.requests.listReleaseDetails(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listSentenceCalculations = function (query, page, size) {
  return this.requests.listSentenceCalculations(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.listSentences = function (query, page, size) {
  return this.requests.listSentences(Object.assign({}, query, { page, size })).then(helpers.handleResponse([]));
};





ReportsRepository.prototype.getOffender = function (offenderId) {
  return this.requests.getOffender({ offenderId }).then(helpers.handleResponse());
};

ReportsRepository.prototype.getOffenderByNomsId = function (nomsId) {
  return this.requests.getOffenderByNomsId({ nomsId }).then(helpers.handleResponse());
};

ReportsRepository.prototype.getOffenderAddresses = function (offenderId) {
  return this.requests.getOffenderAddresses({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderAlerts = function (offenderId) {
  return this.requests.getOffenderAlerts({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderAssessments = function (offenderId) {
  return this.requests.getOffenderAssessments({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderCharges = function (offenderId) {
  return this.requests.getOffenderCharges({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderContactPersons = function (offenderId) {
  return this.requests.getOffenderContactPersons({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderCourtEvents = function (offenderId) {
  return this.requests.getOffenderCourtEvents({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderDiaryDetails = function (offenderId) {
  return this.requests.getOffenderDiaryDetails({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderEmployments = function (offenderId) {
  return this.requests.getOffenderEmployments({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderHealthProblems = function (offenderId) {
  return this.requests.getOffenderHealthProblems({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderIEPs = function (offenderId) {
  return this.requests.getOffenderIEPs({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderImprisonmentStatuses = function (offenderId) {
  return this.requests.getOffenderImprisonmentStatuses({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderMovements = function (offenderId) {
  return this.requests.getOffenderMovements({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderPhysicals = function (offenderId) {
  return this.requests.getOffenderPhysicals({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderRehabDecisions = function (offenderId) {
  return this.requests.getOffenderRehabDecisions({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderReleaseDetails = function (offenderId) {
  return this.requests.getOffenderReleaseDetails({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderSentenceCalculations = function (offenderId) {
  return this.requests.getOffenderSentenceCalculations({ offenderId }).then(helpers.handleResponse([]));
};

ReportsRepository.prototype.getOffenderSentences = function (offenderId) {
  return this.requests.getOffenderSentences({ offenderId }).then(helpers.handleResponse([]));
};

module.exports = ReportsRepository;
