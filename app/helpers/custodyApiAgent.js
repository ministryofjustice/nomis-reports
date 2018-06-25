const apiAgent = require('./apiAgent');
const qs = require('querystring');

function custodyAuthHeaderPlugin (config) {
  return function (request) {
    let token = 'Basic ' + (new Buffer(`${qs.escape(config.oauth.username)}:${qs.escape(config.oauth.password)}`)).toString('base64');

    if (config.oauth.bearerToken) {
      token = `Bearer ${config.oauth.bearerToken}`;
    }

    if (config.custodyJwt && config.custodyJwt.access_token) {
      token = 'Bearer ' + config.custodyJwt.access_token;
    }

    request.set('Authorization', token);

    return request;
  };
}

module.exports = (agent, plugins = [], opts = {}) =>
  apiAgent(agent, plugins.concat([ custodyAuthHeaderPlugin(opts) ]), opts);
