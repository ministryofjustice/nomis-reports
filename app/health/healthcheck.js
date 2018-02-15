const healthCheckAgent = require('../services/healthCheck');
const nomisApiAgent = require('../workers/helpers/nomisApiAgent');
const eliteApiAgent = require('../workers/helpers/eliteApiAgent');

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

const nomisApiCheck = (config, logger) =>
  healthCheckAgent(nomisApiAgent(undefined, undefined, config), 'nomis-api', config, {logger}).version;

const eliteApiCheck = (config, logger) =>
  healthCheckAgent(eliteApiAgent(undefined, undefined, config), 'elite2-api', config, {logger}).infoHealth;

module.exports = function healthcheck(config, log) {
  let response = {
    healthy: true,
    status: 'UP',
    checks: {}
  };

  const checks = [];
  if (config.nomis) checks.push(nomisApiCheck(config.nomis, log));
  if (config.elite2) checks.push(eliteApiCheck(config.elite2, log));

  if (!checks.length) return new Promise(res => res(addAppInfo(response)));

  return Promise.all(checks.map(fn => fn()))
      .then(results => {
        response.healthy = results.every(x => x.health || x.healthy || ['OK', 'UP'].indexOf(x.status));
        if (response.healthy) response.status = 'UP';
        response.checks = results.reduce(gatherCheckInfo, {});

        return response;
      })
      .then(addAppInfo);
};
