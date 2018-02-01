const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function BookingRepository(config, agent) {
  this.config = Object.assign({ limit: 100 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    list: this.agent.get(`${this.config.elite2.apiUrl}/bookings`),
    getDetails: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId`),
      getSentenceDetail: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/sentenceDetail`),
      getMainOffence: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/mainOffence`),
      getIepSummary: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/iepSummary`),

      listAliases: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/aliases`),
      listContacts: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/contacts`),
      listAdjudications: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/adjudications`),

      listScheduledVisits: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/visits`),
         listScheduledVisitsToday: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/visits/today`),
      listAppointments: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/appointments`),
        listAppointmentsTodays: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/appointments/today`),
        listAppointmentsThisWeek: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/appointments/thisWeek`),
        listAppointmentsNextWeek: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/appointments/nextWeek`),
      getAccountBalances: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/balances`),
      listActivities: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/activities`),
        listActivitiesToday: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/activities/today`),
      listEvents: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/events`),
        listEventsToday: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/events/today`),
        listEventsThisWeek: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/events/thisWeek`),
        listEventsNextWeek: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/events/nextWeek`),
      listCaseNotes: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/caseNotes`),
        countCaseNotesByType: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/caseNotes/:type/:subType:/count`),
        getCaseNoteDetail: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/caseNotes/:caseNoteId`),
      listAlerts: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/alerts`),
        getAlertDetails: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/alerts/:alertId`),
      listAssessments: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/assessment/:assessmentCode`),
        getAssessmentDetail: this.agent.get(`${this.config.elite2.apiUrl}/bookings/:bookingId/assessment/:assessmentCode`),
  };
}

BookingRepository.prototype.list = function (query, pageOffset, retries = 0) {
  let next = 1200;
  let repository = this;

  return this.requests.list({ query })
    .set('Page-Limit', this.config.limit)
    .set('Page-Offset', (pageOffset || 0) * this.config.limit)
    .catch((err) => {
      if (retries < 5) {
        console.log('RETRYING', retries, query, pageOffset);
        return new Promise((resolve, reject) => {
          setTimeout(() => repository.list(query, pageOffset, ++retries).then((data) => resolve(data), (err) => reject(err)), next * retries);
        });
      }

      return Promise.reject(err.response.error);
    })
    .then(helpers.handleResponse([]));
};

BookingRepository.prototype.getDetails = function (bookingId, retries = 0) {
  let next = 1200;
  let repository = this;

  return this.requests.getDetails({ bookingId })
    .catch((err) => {
      if (retries < 5) {
        console.log('RETRYING', retries, bookingId);
        return new Promise((resolve, reject) => {
          setTimeout(() => repository.getDetails(bookingId, ++retries).then((data) => resolve(data), (err) => reject(err)), next * retries);
        });
      }

      return Promise.reject(err.response.error);
    })
    .then(helpers.handleResponse());
};

BookingRepository.prototype.getSentenceDetail = function (bookingId) {
  return this.requests.getSentenceDetail({ bookingId }).then(helpers.handleResponse());
};

BookingRepository.prototype.getMainOffence = function (bookingId) {
  return this.requests.getMainOffence({ bookingId }).then(helpers.handleResponse());
};

BookingRepository.prototype.getIepSummary = function (bookingId) {
  return this.requests.getIepSummary({ bookingId }).then(helpers.handleResponse());
};

BookingRepository.prototype.listAliases = function (bookingId, query) {
  return this.requests.listAliases({ bookingId }, query).set('Page-Limit', this.config.limit).then(helpers.handleResponse([]));
};

BookingRepository.prototype.listContacts = function (bookingId, query) {
  return this.requests.listContacts({ bookingId }, query).set('Page-Limit', this.config.limit).then(helpers.handleResponse([]));
};

BookingRepository.prototype.listAdjudications = function (bookingId, query) {
  return this.requests.listAdjudications({ bookingId }, query).set('Page-Limit', this.config.limit).then(helpers.handleResponse([]));
};

BookingRepository.prototype.listAlerts = function (bookingId, query) {
  return this.requests.listAlerts({ bookingId }, query).set('Page-Limit', this.config.limit).then(helpers.handleResponse([]));
};

module.exports = BookingRepository;
