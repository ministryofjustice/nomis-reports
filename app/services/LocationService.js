const LocationRepository = require('../repositories/LocationRepository');
const CachingRepository = require('../helpers/CachingRepository');

const describe = (name, promise, alt) =>
  promise.then((data) => ({ [name]: (data || alt) }));

function LocationService(config, repo) {
  this.config = config;
  this.repository = repo || new CachingRepository(LocationRepository, config);
}

LocationService.prototype.listTypes = function (query) {
  return this.repository.list(query)
      .then((x) => x.reduce((a, b) => {
        if (!~a.indexOf(b.locationType)) {
          a.push(b.locationType);
        }

        return a;
      }, [])
      .map((x) => `/locations/types/${x}` ));
};

LocationService.prototype.list = function (query) {
  return this.repository.list(query)
    .then((x) => x.map((x) => `/locations/${x.locationId}`));
};

LocationService.prototype.listByType = function (type, query) {
  return this.repository.list(query)
    .then((x) => x.filter((x) => x.locationType === type).map((x) => `/locations/${x.locationId}`));
};

LocationService.prototype.getDetails = function (locationId) {
  return Promise.all([
    this.repository.getDetails(locationId),
    describe('location', this.list({ query: `parentLocationId:eq:${locationId}` })),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}))
  .then((location) => ({
    id: `/locations/${location.locationId}`,
    type: `/agencyType/${location.locationType}`,
    label: location.userDescription,
    agency: `/agencies/${location.agencyId}`,
    parentLocation: location.parentLocationId ? `/locations/${location.parentLocationId}` : undefined,
    currentOccupancy: location.currentOccupancy,
    operationalCapacity: location.operationalCapacity,
    usage: location.locationUsage,
    code: location.locationPrefix,
    shortCode: location.description,
    location: location.location,
  }))
  .then((location) => {
    if (location.location.length === 0) {
      delete location.location;
    }
    return location;
  });
};

LocationService.prototype.listInmates = function (locationId, query) {
  return this.repository.listInmates(locationId, query)
    .then((x) => x.map((x) => `/bookings/${x.bookingId}` ));
};

module.exports = LocationService;
