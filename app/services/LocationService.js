const log = require('../../server/log');

const ProcessAgent = require('../helpers/MainProcessAgent');
const BatchProcessor = require('../helpers/BatchProcessor');

const describe = (name, promise, alt, map) =>
  promise
    .then((data) => ({ [name]: (data || alt) }))
    .then((data) => data.map && map ? data.map(map) : data)
    .catch((err) => {
      log.debug(err, { name }, 'LocationService describe ERROR');

      return alt;
    });

function LocationService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

LocationService.prototype.list = function (query, pageOffset, pageSize) {
  return this.agent.request('location', 'list', query, pageOffset, pageSize)
    .then((x) => x.map((x) => ({
      id: `/locations/${x.locationId}`,
      type: `/locationType/${x.locationType}`
    })));
};

LocationService.prototype.all = function (query, pageSize = 1000, batchSize = 5) {
  let batch = new BatchProcessor({ batchSize });
  return batch.run((pageOffset = 0) => this.list(query || {}, pageOffset, pageSize));
};

LocationService.prototype.listTypes = function (query) {
  return this.all(query)
      .then((x) => x.reduce((a, b) => {
        if (!~a.indexOf(b.type)) {
          a.push(b.type);
        }

        return a;
      }, [])
      .map((x) => ({ id: x })));
};

LocationService.prototype.listByType = function (type, query) {
  return this.all(query)
    .then((x) => x.filter((x) => x.locationType === type).map((x) => ({ id: `/locations/${x.locationId}` })));
};

LocationService.prototype.getDetails = function (locationId) {
  return Promise.all([
    this.agent.request('location', 'getDetails', locationId)
      .catch((err) => {
        log.debug(err, { locationId }, 'LocationService allDetails ERROR');

        return { locationId };
      }),
    describe('location', this.all({ query: `parentLocationId:eq:${locationId}` }), []),
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
  return this.agent.request('location', 'listInmates', locationId, query)
    .then((x) => x.map((x) => ({ id: `/bookings/${x.bookingId}` }) ));
};

module.exports = LocationService;
