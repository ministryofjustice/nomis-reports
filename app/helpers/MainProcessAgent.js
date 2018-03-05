const AgencyRepository = require('../repositories/AgencyRepository');
const BookingRepository = require('../repositories/BookingRepository');
const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');
const LocationRepository = require('../repositories/LocationRepository');
const OffenderRepository = require('../repositories/OffenderRepository');
const CaseNoteRepository = require('../repositories/CaseNoteRepository');
const PrisonRepository = require('../repositories/PrisonRepository');
const UserRepository = require('../repositories/UserRepository');

const CachingRepository = require('./CachingRepository');
const RetryingRepository = require('./RetryingRepository');

const log = require('../../server/log');

const services = {
  agency: (config) => new CachingRepository(new RetryingRepository(new AgencyRepository(config))),
  booking: (config) => new CachingRepository(new RetryingRepository(new BookingRepository(config))),
  custodyStatus: (config) => new CachingRepository(new RetryingRepository(new CustodyStatusRepository(config))),
  location: (config) => new CachingRepository(new RetryingRepository(new LocationRepository(config))),
  offender: (config) => new CachingRepository(new RetryingRepository(new OffenderRepository(config))),
  caseNote: (config) => new CachingRepository(new RetryingRepository(new CaseNoteRepository(config))),
  prison: (config) => new CachingRepository(new RetryingRepository(new PrisonRepository(config))),
  user: (config) => new UserRepository(config),
};

const setJwt = (config) => (token) => {
  config.elite2.elite2Jwt = token;
};

const removeJwt = (config) => {
  delete config.elite2.elite2Jwt;
};

function MainProcessAgent(config) {
  this.requestId = 0;
  this.config = config;
}

MainProcessAgent.prototype.login = function() {
  log.debug('MainProcessAgent login BEGIN');

  return (this.config.elite2.elite2Jwt) ?
          Promise.resolve() :
          this.request('user', 'login')
            .then(setJwt(this.config))
            .then(() => log.debug('MainProcessAgent login SUCCESS'));
};

MainProcessAgent.prototype.request = function(repository, method, ...params) {
  const request = { config: this.config, requestId: ++this.requestId, repository, method, params };

  log.debug({
    repository: request.repository,
    method: request.method,
    params: request.repository !== 'user' ? request.params : undefined
  }, 'RPC makeRequest BEGIN');

  let builder = services[request.repository];

  if (typeof builder !== 'function') {
    let error = new Error(`${request.repository} is an unknown Repository Builder`);
    log.error(error, { repository: request.repository, method: request.method }, 'RPC makeRequest UNKNOWN REPOSITORY');
    process.send({ request, error });
    return;
  }

  return Promise.resolve(services[request.repository](request.config))
    .then((repository) => repository[request.method].apply(repository, request.params))
    .then((response) => {
      log.debug({repository, method, params}, 'MainProcessAgent message SUCCESS');
      return response;
    })
    .catch((error) => {
      if (error.status === 401) { //unauthorised
        log.debug(error, 'MainProcessAgent message UNAUTHORISED');
        removeJwt(this.config);
        return this.login().then(() => this.request.apply(this, [repository, method].concat(params)));
      }

      return Promise.reject(error);
    });
};

module.exports = MainProcessAgent;
