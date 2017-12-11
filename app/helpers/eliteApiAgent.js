const apiAgent = require('./apiAgent');
const apiGatewayAuth = require('./apiGatewayAuth');

function authHeaderPlugin (tokenGenerator) {
  return (request) => {
    request.set('Authorization', 'Bearer ' + tokenGenerator());

    return request;
  };
}

function eliteAuthHeaderPlugin (tokenGenerator) {
  return (request) => {
    request.set('Elite-Authorization', tokenGenerator());

    return request;
  };
}

module.exports = (agent, opts = {}) =>
  apiAgent(agent, [
    authHeaderPlugin(apiGatewayAuth(opts.apiGatewayToken, opts.apiGatewayPrivateKey)),
    eliteAuthHeaderPlugin(() => 'ELITE2-API-TOKEN')
  ], opts.timeout);

  /*

  const login = (req, res) => {
    elite2Api.httpRequest({
      method: 'post',
      url: '/users/login',
      data: req.body,
    }).then((response) => {
      const jwtToken = session.newJWT(response.data);
      res.setHeader('jwt', jwtToken);
      res.json(jwtToken);
    }).catch(error => {
      res.status(errorStatusCode(error.response));
      res.end();
    });
  };

  */



  /*
  const jwt = require('jsonwebtoken');
  const version = require('./application-version');

  const minutes = process.env.WEB_SESSION_TIMEOUT_IN_MINUTES || 20;
  const key = process.env.NOMS_TOKEN || 'test';

  const newJWT = (data) => jwt.sign({ data: {
    ...data,
    applicationVersion: version,
  },
    exp: Math.floor(Date.now() / 1000) + (60 * minutes),
  }, key);

  const getSessionData = (headers) => {
    try {
      const token = headers.jwt;
      if (!token) return null;

      return jwt.verify(token, key).data;
    } catch (e) { } // eslint-disable-line no-empty
    return null;
  };

  const isAuthenticated = (headers) => getSessionData(headers) !== null;
  const extendSession = (headers) => newJWT(getSessionData(headers));

  const service = {
    isAuthenticated,
    getSessionData,
    newJWT,
    extendSession,
  };

  module.exports = service;

  */
