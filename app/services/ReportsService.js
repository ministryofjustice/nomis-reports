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
    describe('assessments', this.getOffenderAssessments(offenderId), []),
    describe('charges', this.getOffenderCharges(offenderId), []),
    describe('contactPersons', this.getOffenderContactPersons(offenderId), []),
    describe('courtEvents', this.getOffenderCourtEvents(offenderId), []),
    describe('diaryDetails', this.getOffenderDiaryDetails(offenderId), []),
    describe('employments', this.getOffenderEmployments(offenderId), []),
    describe('healthProblems', this.getOffenderHealthProblems(offenderId), []),
    describe('ieps', this.getOffenderIEPs(offenderId), []),
    describe('imprisonmentStatuses', this.getOffenderImprisonmentStatuses(offenderId), []),
    describe('movements', this.getOffenderMovements(offenderId), []),
    describe('physicals', this.getOffenderPhysicals(offenderId), []),
    describe('rehabDecisions', this.getOffenderRehabDecisions(offenderId), []),
    describe('releaseDetails', this.getOffenderReleaseDetails(offenderId), []),
    describe('sentenceCalculations', this.getOffenderSentenceCalculations(offenderId), []),
    describe('sentences', this.getOffenderSentences(offenderId), []),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}));
};




ReportsService.prototype.listAddresses = function (query, page, size) {
  return this.agent.request('reports', 'listAddresses', query, page, size);
};

ReportsService.prototype.listAssessments = function (query, page, size) {
  return this.agent.request('reports', 'listAssessments', query, page, size);
};

ReportsService.prototype.listCharges = function (query, page, size) {
  return this.agent.request('reports', 'listCharges', query, page, size);
};

ReportsService.prototype.listHealthProblems = function (query, page, size) {
  return this.agent.request('reports', 'listHealthProblems', query, page, size);
};

ReportsService.prototype.listImprisonmentStatuses = function (query, page, size) {
  return this.agent.request('reports', 'listImprisonmentStatuses', query, page, size);
};

ReportsService.prototype.listMovements = function (query, page, size) {
  return this.agent.request('reports', 'listMovements', query, page, size);
};

ReportsService.prototype.listOffences = function (query, page, size) {
  return this.agent.request('reports', 'listOffences', query, page, size);
};

ReportsService.prototype.listOffenders = function (query, page, size) {
  return this.agent.request('reports', 'listOffenders', query, page, size);
};

ReportsService.prototype.listReleaseDetails = function (query, page, size) {
  return this.agent.request('reports', 'listReleaseDetails', query, page, size);
};

ReportsService.prototype.listSentenceCalculations = function (query, page, size) {
  return this.agent.request('reports', 'listSentenceCalculations', query, page, size);
};

ReportsService.prototype.listSentences = function (query, page, size) {
  return this.agent.request('reports', 'listSentences', query, page, size);
};





ReportsService.prototype.getOffender = function (offenderId) {
  return this.agent.request('reports', '', offenderId);
};

ReportsService.prototype.getOffenderAddresses = function (offenderId) {
  return this.agent.request('reports', 'Addresses', offenderId);
};

ReportsService.prototype.getOffenderAssessments = function (offenderId) {
  return this.agent.request('reports', 'Assessments', offenderId);
};

ReportsService.prototype.getOffenderCharges = function (offenderId) {
  return this.agent.request('reports', 'Charges', offenderId);
};

ReportsService.prototype.getOffenderContactPersons = function (offenderId) {
  return this.agent.request('reports', 'ContactPersons', offenderId);
};

ReportsService.prototype.getOffenderCourtEvents = function (offenderId) {
  return this.agent.request('reports', 'CourtEvents', offenderId);
};

ReportsService.prototype.getOffenderDiaryDetails = function (offenderId) {
  return this.agent.request('reports', 'DiaryDetails', offenderId);
};

ReportsService.prototype.getOffenderEmployments = function (offenderId) {
  return this.agent.request('reports', 'Employments', offenderId);
};

ReportsService.prototype.getOffenderHealthProblems = function (offenderId) {
  return this.agent.request('reports', 'HealthProblems', offenderId);
};

ReportsService.prototype.getOffenderIEPs = function (offenderId) {
  return this.agent.request('reports', 'IEPs', offenderId);
};

ReportsService.prototype.getOffenderImprisonmentStatuses = function (offenderId) {
  return this.agent.request('reports', 'ImprisonmentStatuses', offenderId);
};

ReportsService.prototype.getOffenderMovements = function (offenderId) {
  return this.agent.request('reports', 'Movements', offenderId);
};

ReportsService.prototype.getOffenderPhysicals = function (offenderId) {
  return this.agent.request('reports', 'Physicals', offenderId);
};

ReportsService.prototype.getOffenderRehabDecisions = function (offenderId) {
  return this.agent.request('reports', 'RehabDecisions', offenderId);
};

ReportsService.prototype.getOffenderReleaseDetails = function (offenderId) {
  return this.agent.request('reports', 'ReleaseDetails', offenderId);
};

ReportsService.prototype.getOffenderSentenceCalculations = function (offenderId) {
  return this.agent.request('reports', 'SentenceCalculations', offenderId);
};

ReportsService.prototype.getOffenderSentences = function (offenderId) {
  return this.agent.request('reports', 'Sentences', offenderId);
};

module.exports = ReportsService;
