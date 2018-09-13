const apiAgent = require('./apiAgent');

function eliteAuthHeaderPlugin (config) {
  return function (request) {
    let token = 'Bearer ';

    if (config.oauth && config.oauth.bearerToken) {
      token += config.oauth.bearerToken;
    } else if (config.jwt && config.jwt.access_token) {
      token += config.jwt.access_token;
    }

    request.set('Authorization', token);

    return request;
  };
}

module.exports = (agent, plugins = [], opts = {}) =>
  apiAgent(agent, plugins.concat([ eliteAuthHeaderPlugin(opts) ]), opts);
