const apiAgent = require('../helpers/apiAgent');
const qs = require('querystring');

const helpers = require('../helpers');

function UserRepository(config, agent) {
  this.config = Object.assign({ limit: 2000 }, config);
  this.agent = apiAgent(agent, undefined, this.config.custody);

  this.requests = {
    login: this.agent.post(`${this.config.custody.authUrl}/token`),
  };
}

UserRepository.prototype.login = function (username = '', password = '', grantType = 'client_credentials') {
  if (grantType === 'client_credentials') {
    let token = `Basic ${(new Buffer(`${qs.escape(username)}:${qs.escape(password)}`)).toString('base64')}`;

    return this.requests.login({ grant_type: grantType })
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', token)
      .then(helpers.handleResponse([]));
  }

  // password ??
  return this.requests.login({ grant_type: grantType, username, password })
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .then(helpers.handleResponse([]));
};

module.exports = UserRepository;
