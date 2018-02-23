const ProcessAgent = require('../helpers/MainProcessAgent');

function CustodyStatusService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ProcessAgent(this.config);
}

CustodyStatusService.prototype.all = function (query) {
  return this.list(query);
};

CustodyStatusService.prototype.list2 = function (query, pageOffset) {
  return this.agent.request('custodyStatus', 'list', query, pageOffset);
  /*
    .then((x) => x.map((x) => ({
      id: `/offenders/${x.bookingId}`,
      custodyStatusCode: x.custodyStatusCode,
    })));
  */
};

CustodyStatusService.prototype.list = function (query, pageOffset) {
  return this.agent.request('custodyStatus', 'list', query, pageOffset);
};

CustodyStatusService.prototype.getStatus = function (nomsId, query) {
  return this.agent.request('custodyStatus', 'getStatus', nomsId, query);
};

module.exports = CustodyStatusService;
