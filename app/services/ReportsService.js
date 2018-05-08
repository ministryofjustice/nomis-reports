const log = require('../../server/log');

const ProcessAgent = require('../helpers/MainProcessAgent');

const describe = (name, promise, alt, map) =>
  promise
    .then((data) => ({ [name]: (data || alt) }))
    .then((data) => data.map && map ? data.map(map) : data)
    .catch((err) => {
      log.error({ name, err }, 'ReportsService describe ERROR');

      return alt;
    });

function ReportsService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

ReportsService.prototype.listOffenders = function (query, page, size) {
  return this.agent.request('reports', 'listOffenders', query, page, size)
    .then(response => {
      response._embedded.offenders =
        response._embedded.offenders
          .filter(o => (o.bookings && o.bookings[0] && o.bookings[0].agencyLocationId && o.bookings[0].agencyLocationId !== 'ZZGHI'));

      return response;
    });
};

ReportsService.prototype.getDetails = function (offenderId) {
  return Promise.all([
    this.getOffender(offenderId),
    describe('addresses', this.getOffenderAddresses(offenderId), []),
    describe('movements', this.getOffenderMovements(offenderId), []),
    describe('charges', this.getOffenderCharges(offenderId), []),
    describe('contactPersons', this.getOffenderContactPersons(offenderId), []),
    describe('employments', this.getOffenderEmployments(offenderId), []),
    describe('sentences', this.getOffenderSentences(offenderId), []),
    describe('assessments', this.getOffenderAssessments(offenderId), []),
    describe('healthProblems', this.getOffenderHealthProblems(offenderId), []),
    describe('imprisonmentStatuses', this.getOffenderImprisonmentStatuses(offenderId), []),
    describe('releaseDetails', this.getOffenderReleaseDetails(offenderId), []),
    describe('sentenceCalculations', this.getOffenderSentenceCalculations(offenderId), []),
    describe('physicals', this.getOffenderPhysicals(offenderId), []),
    describe('ieps', this.getOffenderIEPs(offenderId), []),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}));
};

ReportsService.prototype.getOffender = function (offenderId) {
  return this.agent.request('reports', 'getOffender', offenderId);
};

ReportsService.prototype.getOffenderAddresses = function (offenderId) {
  return this.agent.request('reports', 'getOffenderAddresses', offenderId);
};

ReportsService.prototype.getOffenderMovements = function (offenderId) {
  return this.agent.request('reports', 'getOffenderMovements', offenderId);
};

ReportsService.prototype.getOffenderCharges = function (offenderId) {
  return this.agent.request('reports', 'getOffenderCharges', offenderId);
};

ReportsService.prototype.getOffenderContactPersons = function (offenderId) {
  return this.agent.request('reports', 'getOffenderContactPersons', offenderId);
};

ReportsService.prototype.getOffenderEmployments = function (offenderId) {
  return this.agent.request('reports', 'getOffenderEmployments', offenderId);
};

ReportsService.prototype.getOffenderSentences = function (offenderId) {
  return this.agent.request('reports', 'getOffenderSentences', offenderId);
};

ReportsService.prototype.getOffenderAssessments = function (offenderId) {
  return this.agent.request('reports', 'getOffenderAssessments', offenderId);
};

ReportsService.prototype.getOffenderHealthProblems = function (offenderId) {
  return this.agent.request('reports', 'getOffenderHealthProblems', offenderId);
};

ReportsService.prototype.getOffenderImprisonmentStatuses = function (offenderId) {
  return this.agent.request('reports', 'getOffenderImprisonmentStatuses', offenderId);
};

ReportsService.prototype.getOffenderReleaseDetails = function (offenderId) {
  return this.agent.request('reports', 'getOffenderReleaseDetails', offenderId);
};

ReportsService.prototype.getOffenderSentenceCalculations = function (offenderId) {
  return this.agent.request('reports', 'getOffenderSentenceCalculations', offenderId);
};

ReportsService.prototype.getOffenderPhysicals = function (offenderId) {
  return this.agent.request('reports', 'getOffenderPhysicals', offenderId);
};

ReportsService.prototype.getOffenderIEPs = function (offenderId) {
  return this.agent.request('reports', 'getOffenderIEPs', offenderId);
};

ReportsService.prototype.listAddresses = function (query, page, size) {
  return this.agent.request('reports', 'listAddresses', query, page, size);
};

ReportsService.prototype.listMovements = function (query, page, size) {
  return this.agent.request('reports', 'listMovements', query, page, size);
};

ReportsService.prototype.listCharges = function (query, page, size) {
  return this.agent.request('reports', 'listCharges', query, page, size);
};

ReportsService.prototype.listSentences = function (query, page, size) {
  return this.agent.request('reports', 'listSentences', query, page, size);
};

module.exports = ReportsService;
