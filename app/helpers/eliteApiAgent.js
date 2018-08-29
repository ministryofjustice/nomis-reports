const apiAgent = require('./apiAgent');
const qs = require('querystring');

function eliteAuthHeaderPlugin (config) {
  return function (request) {
    let token = `${config.oauth.grantType} ` + (new Buffer(`${qs.escape(config.oauth.username)}:${qs.escape(config.oauth.password)}`)).toString('base64');

    if (config.elite2Jwt && config.elite2Jwt.access_token) {
      token = 'Bearer ' + config.elite2Jwt.access_token;
    }

    request.set('Authorization', token);

    return request;
  };
}

module.exports = (agent, plugins = [], opts = {}) =>
  apiAgent(agent, plugins.concat([ eliteAuthHeaderPlugin(opts) ]), opts);
