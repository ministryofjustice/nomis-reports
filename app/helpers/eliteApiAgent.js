const nomisApiAgent = require('./nomisApiAgent');

function eliteAuthHeaderPlugin (config) {
  return function (request) {
    request.set('Elite-Authorization', (config.elite2Jwt && config.elite2Jwt.token || 'NO-AUTH'));
    //request.set('Authorization', (config.elite2Jwt && config.elite2Jwt.token || 'NO-AUTH'));

    return request;
  };
}

module.exports = (agent, plugins = [], opts = {}) =>
  nomisApiAgent(agent, plugins.concat([ eliteAuthHeaderPlugin(opts) ]), opts);
