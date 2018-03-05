const nomisApiAgent = require('../helpers/nomisApiAgent');

const helpers = require('../helpers');

function CaseNoteRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = nomisApiAgent(agent, undefined, this.config.nomis);

  let root = this.config.nomis.apiUrl;

  this.requests = {
    list: this.agent.get(`${root}/case_notes/for_delius`),
  };
}

CaseNoteRepository.prototype.list = function (query) {
  return this.requests.list(query).then(helpers.handleResponse([]));
};

module.exports = CaseNoteRepository;
