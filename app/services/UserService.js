const ChildProcessAgent = require('../helpers/ChildProcessAgent');

const setJwt = (config) => (token) => {
  config.elite2.elite2Jwt = token;
};

function UserService(config, childProcessAgent) {
  this.config = config;
  this.agent = childProcessAgent || new ChildProcessAgent(this.config);
}

UserService.prototype.login = function (username, password) {
  return this.agent.request('user', 'login', username, password).then(setJwt(this.config));
};

module.exports = UserService;
