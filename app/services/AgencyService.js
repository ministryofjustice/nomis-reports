const log = require('../../server/log');

const ProcessAgent = require('../helpers/MainProcessAgent');
//const BatchProcessor = require('../helpers/BatchProcessor');

const describe = (name, promise, alt, map) =>
  promise
    .then((data) => ({ [name]: (data || alt) }))
    .then((data) => data.map && map ? data.map(map) : data)
    .catch((err) => {
      log.error(err, {name}, 'AgencyService describe ERROR');

      return alt;
    });

function AgencyService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

AgencyService.prototype.list = function (query, pageOffset, pageSize) {
  return this.agent.request('agency', 'list', query, pageOffset, pageSize)
    .then((x) => x.map((x) => ({
      id: `/agencies/${x.agencyId}`,
      type: `/agencies/types/${x.agencyType}`
    })));
};
/*
AgencyService.prototype.all = function (query, pageSize = 1000, batchSize = 5) {
  let batch = new BatchProcessor({ batchSize });
  return batch.run((pageOffset = 0) => this.list(query || {}, pageOffset, pageSize));
};
*/
AgencyService.prototype.listTypes = function (query) {
  return this.list(query)
      .then((x) => x.reduce((a, b) => {
        if (!~a.indexOf(b.type)) {
          a.push(b.type);
        }

        return a;
      }, [])
      .map((x) => ({ id: x })));
};

AgencyService.prototype.listByType = function (typeId, query) {
  return this.list(query)
    .then((x) => x.filter((x) => x.type === `/agencies/types/${typeId}`));
};

AgencyService.prototype.getDetails = function (agencyId) {
  return Promise.all([
    this.agent.request('agency', 'getDetails', agencyId)
      .catch((err) => {
        log.error(err, {agencyId}, 'AgencyService getDetails ERROR');

        return { agencyId };
      }),
    describe('address', this.agent.request('agency', 'getContactDetails', agencyId), undefined),
    describe('location', this.listLocations(agencyId), undefined),
  ])
  .then((data) => data.reduce((a, b) => Object.assign(a, b), {}))
  .then((agency) => Object.assign(
    {
      id: `/agencies/${agency.agencyId}`,
      type: `/agencies/types/${agency.agencyType}`,
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

AgencyService.prototype.listLocations = function (agencyId, query, pageOffset, pageSize) {
  return this.agent.request('agency', 'listLocations', agencyId, query, pageOffset, pageSize)
    .then((x) => x.map((x) => ({
      id: `/locations/${x.locationId}`,
      type: `/locations/types/${x.locationType}`
    }) ));
};

module.exports = AgencyService;
