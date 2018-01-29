const AgencyRepository = require('../repositories/AgencyRepository');
const CachingRepository = require('../helpers/CachingRepository');

const describe = (name, promise, alt) =>
  promise.then((data) => ({ [name]: (data || alt) }));

function AgencyService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(AgencyRepository, config);
}

AgencyService.prototype.listTypes = function (query) {
  return this.repository.list(query)
      .then((x) => x.reduce((a, b) => {
        if (!~a.indexOf(b.agencyType)) {
          a.push(b.agencyType);
        }

        return a;
      }, [])
      .map((x) => `/agencyType/${x}` ));
};

AgencyService.prototype.list = function (query) {
  return this.repository.list(query)
    .then((x) => x.map((x) => `/agencies/${x.agencyId}`));
};

AgencyService.prototype.listByType = function (type, query) {
  return this.repository.list(query)
    .then((x) => x.filter((x) => x.agencyType === type).map((x) => `/agencies/${x.agencyId}`));
};

AgencyService.prototype.getDetails = function (agencyId) {
  return Promise.all([
    this.repository.getDetails(agencyId),
    describe('address', this.repository.getContactDetails(agencyId)),
    describe('location', this.listLocations(agencyId)),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}))
  .then((agency) => Object.assign(
    {
      id: `/agencies/${agency.agencyId}`,
      type: `/agencyType/${agency.agencyType}`,
      label: agency.description,
    },
    agency))
  .then((agency) => {
    if (agency.address) {
      if (agency.address.phones) {
        agency.phoneNumber = agency.address.phones
          .map((x) => ({
            type: x.type,
            number: x.number,
            extension: x.ext,
          }));

          delete agency.address.phones;
      }

      delete agency.address.agencyId;

      agency.address.type = agency.address.addressType;
      delete agency.address.addressType;
    }

    delete agency.agencyId;
    delete agency.agencyType;
    delete agency.description;

    if (agency.location.length === 0) {
      delete agency.location;
    }

    return agency;
  });
};

AgencyService.prototype.listLocations = function (agencyId, query) {
  return this.repository.listLocations(agencyId, query)
    .then((x) => x.map((x) => `/locations/${x.locationId}` ));
};

module.exports = AgencyService;
