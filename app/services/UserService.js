const ProcessAgent = require('../helpers/MainProcessAgent');

const setJwt = (config) => (token) => {
  config.elite2.elite2Jwt = token;
  config.custody.custodyJwt = token;
};

function UserService(config, processAgent) {
  this.config = config;
  this.agent = processAgent || new ProcessAgent(this.config);
}

UserService.prototype.login = function (username, password) {
  return this.agent
    .request('user', 'login', username, password)
    .then(setJwt(this.config));
};

module.exports = UserService;
