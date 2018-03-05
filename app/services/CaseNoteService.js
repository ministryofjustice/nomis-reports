const ProcessAgent = require('../helpers/MainProcessAgent');

function CaseNoteService(config, processAgent) {
  this.config = config;
  this.agent = processAgent || new ProcessAgent(this.config);
}

CaseNoteService.prototype.list = function (query) {
  return this.agent.request('caseNote', 'list', query);
};

module.exports = CaseNoteService;
