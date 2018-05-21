const log = require('../../server/log');

const ProcessAgent = require('../helpers/MainProcessAgent');

function LocationService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

LocationService.prototype.list = function (query, pageOffset, pageSize) {
  return this.agent.request('location', 'list', query, pageOffset, pageSize)
    .then((x) => x.map((x) => ({
      id: `/locations/${x.locationId}`,
      type: `/locations/types/${x.locationType}`
    })));
};

LocationService.prototype.listTypes = function (query) {
  return this.list(query)
      .then((x) => x.reduce((a, b) => {
        if (!~a.indexOf(b.type)) {
          a.push(b.type);
        }

        return a;
      }, [])
      .map((x) => ({ id: x })));
};

LocationService.prototype.listByType = function (typeId, query) {
  return this.list(query)
    .then((x) => x.filter((x) => x.type === `/locations/types/${typeId}`));
};

LocationService.prototype.getDetails = function (locationId) {
  return this.agent.request('location', 'getDetails', locationId)
    .catch((err) => {
      log.debug(err, { locationId }, 'LocationService getDetails ERROR');

      return { locationId };
    })
    .then(data => {
      if (!data) {
        let err = new Error(`Location <${locationId}> not found`);
        err.status = 404;

        throw err;
      }

      let location = {
        id: `/locations/${data.locationId}`,
        type: `/locations/types/${data.locationType}`,
        label: data.userDescription,
        agency: `/agencies/${data.agencyId}`,
        parentLocation: data.parentLocationId ? `/locations/${data.parentLocationId}` : undefined,
        currentOccupancy: data.currentOccupancy,
        operationalCapacity: data.operationalCapacity,
        usage: data.locationUsage,
        code: data.locationPrefix,
        shortCode: data.description,
      };

      return this.list({ query: `parentLocationId:eq:${locationId}` })
        .then(locations => {
          if (locations.length) {
            location.locations = locations;
          }

          return location;
        });
    });
};

module.exports = LocationService;
