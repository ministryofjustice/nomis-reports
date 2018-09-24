const AgencyRepository = require('../repositories/AgencyRepository');
const BookingRepository = require('../repositories/BookingRepository');
const LocationRepository = require('../repositories/LocationRepository');
const OffenceRepository = require('../repositories/OffenceRepository');
const ReportsRepository = require('../repositories/ReportsRepository');
const UserRepository = require('../repositories/UserRepository');

const CachingRepository = require('./CachingRepository');
const RetryingRepository = require('./RetryingRepository');

const log = require('../../server/log');

const setJwt = (config) => (token) => {
  config.jwt = token;

  return token;
};

const removeJwt = (config) => {
  delete config.jwt;

  return config;
};

function MainProcessAgent(config, services) {
  this.requestId = 0;
  this.config = config;
  this.services = services || {
    agency: config => new CachingRepository(new RetryingRepository(new AgencyRepository(config))),
    booking: config => new CachingRepository(new RetryingRepository(new BookingRepository(config))),
    location: config => new CachingRepository(new RetryingRepository(new LocationRepository(config))),
    offence: config => new CachingRepository(new RetryingRepository(new OffenceRepository(config))),
    reports: config => new CachingRepository(new RetryingRepository(new ReportsRepository(config))),
    user: config => new RetryingRepository(new UserRepository(config)),
  };
}

MainProcessAgent.prototype.login = function(config, label) {
  log.debug(`MainProcessAgent login ${label} API BEGIN`);

  return (config.jwt) ?
          Promise.resolve() :
          this.request('user', 'login', config.oauth.username, config.oauth.password, config.oauth.grantType)
            .then(setJwt(config))
            .then(() => log.debug(`MainProcessAgent login ${label} API SUCCESS`));
};

MainProcessAgent.prototype.request = function(repository, method, ...params) {
  const request = {
    config: this.config,
    requestId: ++this.requestId,
    repository,
    method,
    params
  };

  log.debug({
    repository: request.repository,
    method: request.method,
    params: request.repository !== 'user' ? request.params : undefined
  }, 'MainProcessAgent makeRequest BEGIN');

  let builder = this.services[request.repository];

  if (typeof builder !== 'function') {
    let error = new Error(`${request.repository} is an unknown Repository Builder`);
    log.error(error, { repository: request.repository, method: request.method }, 'RPC makeRequest UNKNOWN REPOSITORY');
    process.send({ request, error });
    return;
  }

  return Promise.resolve(builder(request.config))
    .then(repository => repository[request.method].apply(repository, request.params))
    .then(response => {
      log.debug({repository, method, params}, 'MainProcessAgent message SUCCESS');
      return response;
    })
    .catch(error => {
      if (error.status === 401) { //unauthorised
        log.debug(error, 'MainProcessAgent message UNAUTHORISED');

        removeJwt(this.config.elite2);
        removeJwt(this.config.custody);

        return Promise.all([
            this.login(this.config.elite2, 'ELITE2'),
            this.login(this.config.custody, 'CUSTODY')
          ])
          .then(() => this.request.apply(this, [repository, method].concat(params)));
      }

      return Promise.reject(error);
    });
};

module.exports = MainProcessAgent;
