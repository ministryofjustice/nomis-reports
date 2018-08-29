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

let config = {
  name: pkg.name,
  version: pkg.version,

  logLevel: get('LOG_LEVEL', 'debug'),

  dev: dev,
  buildDate: env.BUILD_DATE,
  commitId: env.COMMIT_ID,
  buildTag: env.BUILD_TAG,

  port: get('PORT', 3000),

  nomis: {
    apiUrl: get('NOMIS_API_URL', 'http://localhost:8082/api', { requireInProduction: true }),
    apiGatewayToken: get('GW_TOKEN', '', { requireInProduction: true }),
    apiGatewayPrivateKey: new Buffer(get('GW_KEY', '', { requireInProduction: true }), 'base64').toString('ascii'),
    timeout: {
      response: 20000,
      deadline: 25000
    }
  },

  elite2: {
    apiUrl: get('ELITE2_API_URL', 'http://localhost:8081/api', { requireInProduction: true }),
    timeout: {
      response: 20000,
      deadline: 25000
    },
    oauth: {
      grantType: get('OAUTH_GRANT_TYPE', 'client_credentials', { requireInProduction: true }),
      username: get('OAUTH_USERNAME', 'x_trusted_client', { requireInProduction: true }),
      password: get('OAUTH_PASSWORD', 'x_client_password', { requireInProduction: true }),
    },
  },

  custody: {
    apiUrl: get('REPORT_API_URL', 'http://localhost:8080/api', { requireInProduction: true }),
    timeout: {
      response: 20000,
      deadline: 25000
    },
    oauth: {
      grantType: get('REPORT_GRANT_TYPE', 'client_credentials'),
      username: get('REPORT_USERNAME', 'x_trusted_client'),
      password: get('REPORT_PASSWORD', 'x_client_password'),
      bearerToken: get('REPORT_BEARER_TOKEN', ''),
    },
  }
};

if (!config.custody.oauth.bearerToken && !config.custody.oauth.username && !config.custody.oauth.password && !config.custody.oauth.grantType) {
  throw new Error('Missing env vars either REPORT_BEARER_TOKEN or REPORT_GRANT_TYPE, REPORT_USERNAME and REPORT_PASSWORD');
}

module.exports = config;
