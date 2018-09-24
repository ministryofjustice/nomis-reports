const log = require('../../server/log');

const ProcessAgent = require('../helpers/MainProcessAgent');

function AgencyService(config, processAgent) {
  this.config = config;
  this.agent = processAgent || new ProcessAgent(this.config);
}

AgencyService.prototype.list = function (query, pageOffset, pageSize) {
  return this.agent.request('agency', 'list', query, pageOffset, pageSize)
    .then((x) => x.map((x) => ({
      id: `/agencies/${x.agencyId}`,
      type: `/agencies/types/${x.agencyType}`
    })));
};

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
  return this.agent.request('agency', 'getDetails', agencyId)
    .catch((err) => {
      log.debug(err, { agencyId }, 'AgencyService getDetails ERROR');

      return { agencyId };
    })
    .then(data => {
      if (!data) {
        let err = new Error(`Agency <${agencyId}> not found`);
        err.status = 404;

        throw err;
      }

      return data;
    })
    .then(data => {
      let agency = Object.assign({
          id: `/agencies/${data.agencyId}`,
          type: `/agencies/types/${data.agencyType}`,
          label: data.description,
        },
        data);

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

      return this.agent.request('location', 'list', `agencyId:eq:${agencyId}`)
        .catch(() => Promise.resolve([]))
        .then(locations => {
          if (locations && locations.length) {
            agency.locations = locations;
          }

          return agency;
        });
    });
};

module.exports = AgencyService;
