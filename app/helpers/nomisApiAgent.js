const apiAgent = require('./apiAgent');
const apiGatewayAuth = require('./apiGatewayAuth');

function gatewayAuthTokenPlugin (tokenGenerator = () => 'API-GATEWAY-TOKEN') {
  return (request) => {
    request.set('Authorization', 'Bearer ' + tokenGenerator());

    return request;
  };
}

module.exports = (agent, opts = {}) =>
  apiAgent(agent, [
    gatewayAuthTokenPlugin(apiGatewayAuth(opts.apiGatewayToken, opts.apiGatewayPrivateKey))
  ], opts.timeout);
