const jwt = require('jsonwebtoken');

module.exports = (apiGatewayToken, apiGatewayPrivateKey) => {
  const token = apiGatewayToken;
  const cert = new Buffer(apiGatewayPrivateKey);

  return () =>
    jwt.sign({ iat: Math.round((new Date()).getTime() / 1000), token }, cert, { algorithm: 'ES256' });
};
