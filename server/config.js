require('dotenv').config();
const pkg = require('../package.json');
const env = process.env;

const dev = env.NODE_ENV !== 'production';

const get = (name, fallback, options = {}) => {
  if (process.env[name]) {
      return process.env[name];
  }

  if (fallback !== undefined && (dev || !options.requireInProduction)) {
        return fallback;
    }

    throw new Error('Missing env var ' + name);
};

module.exports = {
  name: pkg.name,
  version: pkg.version,

  dev: dev,
  buildDate: env.BUILD_DATE,
  commitId: env.COMMIT_ID,
  buildTag: env.BUILD_TAG,

  port: env.PORT || '3000',

  nomis: {
    apiUrl: get('NOMIS_API_URL', 'http://localhost:8080/api'),
    apiGatewayToken: get('NOMIS_GW_TOKEN', ''),
    apiGatewayPrivateKey: new Buffer(get('NOMIS_GW_KEY', ''), 'base64').toString('ascii'),
    timeout: {
      response: 2000,
      deadline: 2500
    }
  },

  elite2: {
    apiUrl: get('ELITE2_API_URL', 'http://localhost:8081/api'),
    apiGatewayToken: get('ELITE2_GW_TOKEN', ''),
    apiGatewayPrivateKey: new Buffer(get('ELITE2_GW_KEY', ''), 'base64').toString('ascii'),
    timeout: {
      response: 2000,
      deadline: 2500
    }
  }
};
