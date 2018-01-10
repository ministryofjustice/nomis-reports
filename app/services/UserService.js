const UserRepository = require('../repositories/UserRepository');

const setJwt = (config) => (token) => {
  config.elite2.elite2Jwt = token;
};

function UserService(config, repo) {
  this.config = config;
  this.repository = repo || new UserRepository(config);
}

UserService.prototype.login = function (username, password) {
  return this.repository.login(username, password).then(setJwt(this.config));
};

module.exports = UserService;
