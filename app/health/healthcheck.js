const apiAgent = require('../helpers/apiAgent');
const healthCheckAgent = require('../services/healthCheck');

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

const healthApiCheck = (config, logger, apiName) =>
  healthCheckAgent(apiAgent(undefined, undefined, config), apiName, config, {logger}).health; // + info

module.exports = function healthcheck(config, log) {
  let response = {
    healthy: true,
    status: 'UP',
    checks: {}
  };

  const checks = [];
  if (config.elite2) checks.push(healthApiCheck(config.elite2, log, 'elite2-api'));
  if (config.custody) checks.push(healthApiCheck(config.custody, log , 'cusody-api'));

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
