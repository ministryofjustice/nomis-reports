const superagent = require('superagent');
const tokenGen = require('../helpers/apiGatewayAuth');
const apiHealthCheck = require('../helpers/apiHealthCheck');

const safely = (fn) => {
  try {
    return fn();
  } catch (ex) {
    // ignore failures
  }
};

const getBuild = () => safely(() => require('../../build-info.json'));
const getVersion = () => safely(() => require('../../package.json').version);

const addAppInfo = (result) =>
  Object.assign({}, result, { uptime: process.uptime(), build: getBuild(), version: getVersion() });

const gatherCheckInfo = (total, x) =>
  Object.assign({}, total, {[ x.name ]: (x => (delete x.name) && x)(x)});

const nomisApiCheck = (config) =>
  apiHealthCheck(superagent, tokenGen, config, `${config.apiUrl}/version`, 'nomis-api', 'NOMIS API');

const elite2ApiCheck = (config) =>
  apiHealthCheck(superagent, tokenGen, config, `${config.apiUrl}/info/health`, 'elite2-api', 'ELITE 2 API');

module.exports = function healthcheck(config, log) {
  const checks = [
    nomisApiCheck(config.nomis),
    elite2ApiCheck(config.elite2)
  ];

  return Promise.all(checks.map(fn => fn(log)))
      .then(results => ({
        healthy: results.every(item => item.health || item.healthy || item.status === 'OK'),
        status: results.every(item => item.health || item.healthy || item.status === 'OK') ? 'OK' : undefined,
        checks: results.reduce(gatherCheckInfo, {})
      }))
      .then(addAppInfo);
};
