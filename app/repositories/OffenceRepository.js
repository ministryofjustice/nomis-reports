const apiAgent = require('../helpers/apiAgent');

const helpers = require('../helpers');

function OffenderRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = apiAgent(agent, [
      (request) => {
        request.set('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbnRlcm5hbFVzZXIiOmZhbHNlLCJzY29wZSI6WyJyZXBvcnRpbmciXSwiZXhwIjoxODM5MjUzMzczLCJhdXRob3JpdGllcyI6WyJST0xFX1JFUE9SVElORyJdLCJqdGkiOiI3ZjE0NTdlNi1hYTNiLTQzZWYtOTY3Zi1iZmY4YjgxZTEyMDYiLCJjbGllbnRfaWQiOiJhcGlyZXBvcnRpbmcifQ.lBPf6kUI840svb2ayTvV9jP7hOVFr7bU5ZzyEfqH8RIyMOutCnAcJAcsl4bqI96fId0Db15UEGUEoFMWTBArD17MoomS_U8P-jJxpwhHeHH2UEi_wAv6bLwVbbNvBSxWJ37TiHsPD-hr_63cS7qZs_8xi20dTjmAw8paSMn6jKKb8xUWJWLBAAi0rQZbyOfHva_9deF4W_wSix0oEc0r7CT321Sg93TrijoagJ1X5ha7MzF3wsOJEcvLmIDAAhSYM4ZcJT1ZUvqEd3YVHKrp_X-eqcsKFRmb3lY7IZ-fz10o26gFiagE7yYAb7fuykREiwlMUqzt0lw6K7Suiet5qA');

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
