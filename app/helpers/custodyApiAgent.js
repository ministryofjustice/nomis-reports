const nomisApiAgent = require('./nomisApiAgent');
const qs = require('querystring');

function custodyAuthHeaderPlugin (config) {
  return function (request) {
    let token = 'Basic ' + (new Buffer(`${qs.escape(config.oauth.username)}:${qs.escape(config.oauth.password)}`)).toString('base64');

    if (config.custodyJwt && config.custodyJwt.access_token) {
      token = 'Bearer ' + config.custodyJwt.access_token;
    }

    request.set('Elite-Authorization', token);

    return request;
  };
}

module.exports = (agent, plugins = [], opts = {}) =>
  nomisApiAgent(agent, plugins.concat([ custodyAuthHeaderPlugin(opts) ]), opts);
