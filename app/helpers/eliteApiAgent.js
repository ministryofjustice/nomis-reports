const nomisApiAgent = require('./nomisApiAgent');
const qs = require('querystring');

function eliteAuthHeaderPlugin (config) {
  return function (request) {
    let token = 'Basic ' + (new Buffer(`${qs.escape(config.oauth.username)}:${qs.escape(config.oauth.password)}`)).toString('base64');

    if (config.elite2Jwt && config.elite2Jwt.access_token) {
      token = 'Bearer ' + config.elite2Jwt.access_token;
      //token = 'Basic ' + config.elite2Jwt.access_token;
    }

    request.set('Elite-Authorization', token);

    return request;
  };
}

module.exports = (agent, plugins = [], opts = {}) =>
  nomisApiAgent(agent, plugins.concat([ eliteAuthHeaderPlugin(opts) ]), opts);
