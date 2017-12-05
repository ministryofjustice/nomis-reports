const jwt = require('jsonwebtoken');

module.exports = function generateApiGatewayToken(apiGatewayToken, apiGatewayPrivateKey) {
    const milliseconds = Math.round((new Date()).getTime() / 1000);

    const payload = {
        iat: milliseconds,
        token: apiGatewayToken
    };

    const cert = new Buffer(apiGatewayPrivateKey);

    return jwt.sign(payload, cert, {algorithm: 'ES256'});
};
