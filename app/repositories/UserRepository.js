const eliteApiAgent = require('../helpers/eliteApiAgent');

const helpers = require('../helpers');

function UserRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = eliteApiAgent(agent, undefined, this.config.elite2);

  this.requests = {
    login: this.agent.post(`${this.config.elite2.apiUrl.replace('/api', '')}/oauth/token`),
  };
}

UserRepository.prototype.login = function (username, password) {
  let body = `grant_type=client_credentials`;

  if (username && password) {
    body = `grant_type=password&username=${username}&password=${password}`;
  }

  return this.requests.login(body)
    .set('content-type', 'application/x-www-form-urlencoded')
    .then(helpers.handleResponse([]));
};

module.exports = UserRepository;
