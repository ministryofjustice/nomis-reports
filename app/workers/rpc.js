const AgencyRepository = require('../repositories/AgencyRepository');
const BookingRepository = require('../repositories/BookingRepository');
const CustodyStatusRepository = require('../repositories/CustodyStatusRepository');
const LocationRepository = require('../repositories/LocationRepository');
const OffenderRepository = require('../repositories/OffenderRepository');
const PrisonRepository = require('../repositories/PrisonRepository');
const UserRepository = require('../repositories/UserRepository');

const RetryingRepository = require('../helpers/RetryingRepository');

const log = require('../../server/log');

const services = {
  agency: (config) => new RetryingRepository(new AgencyRepository(config)),
  booking: (config) => new RetryingRepository(new BookingRepository(config)),
  custodyStatus: (config) => new RetryingRepository(new CustodyStatusRepository(config)),
  location: (config) => new RetryingRepository(new LocationRepository(config)),
  offender: (config) => new RetryingRepository(new OffenderRepository(config)),
  prison: (config) => new RetryingRepository(new PrisonRepository(config)),
  user: (config) => new UserRepository(config),
};

const makeRequest = (request) => {
  log.debug({
    repository: request.repository,
    method: request.method,
    params: request.repository !== 'user' ? request.paramss : undefined
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
      log.debug({ repository: request.repository, method: request.method }, 'RPC makeRequest SUCCESS');
      process.send({ request, response });
    })
    .catch((error) => {
      log.error(error, { repository: request.repository, method: request.method }, 'RPC makeRequest ERROR');
      process.send({ request, error });
    });
};

process.on('message', makeRequest);
