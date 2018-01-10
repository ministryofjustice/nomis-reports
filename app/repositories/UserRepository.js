const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function UserRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    login: this.agent.post(`${this.config.elite2.apiUrl}/users/login`),
  };
}

UserRepository.prototype.login = function (username, password) {
  return this.requests.login({ username, password }).then(helpers.handleResponse([]));
};

module.exports = UserRepository;
