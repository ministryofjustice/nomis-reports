const cp = require('child_process');
const log = require('../../server/log');

const setJwt = (config) => (token) => {
  config.elite2.elite2Jwt = token;
};

const removeJwt = (config) => {
  delete config.elite2.elite2Jwt;
};

function ChildProcessAgent(config) {
  this.requestId = 0;
  this.config = config;
}

ChildProcessAgent.prototype.login = function() {
  log.debug('ChildProcessAgent login BEGIN');

  return (this.config.elite2.elite2Jwt) ?
          Promise.resolve() :
          this.request('user', 'login')
            .then(setJwt(this.config))
            .then(() => log.debug('ChildProcessAgent login SUCCESS'))
            .catch((err) => log.error(err, 'ChildProcessAgent Login ERROR'));
};

ChildProcessAgent.prototype.request = function(repository, method, ...params) {
  const rpc = cp.fork('./app/workers/rpc');
  const request = { config: this.config, requestId: ++this.requestId, repository, method, params };

  return (new Promise((resolve, reject) => {
    rpc.on('message', (x) => {
      log.debug({ repository, method, params }, 'ChildProcessAgent message RECEIVED');
      rpc.disconnect();

      x.error ? reject(x.error) : resolve(x.response);
    });

    log.debug({repository, method, params}, 'ChildProcessAgent request SEND');
    rpc.send(request);
  }))
  .then((response) => {
    log.debug({repository, method, params}, 'ChildProcessAgent message SUCCESS');
    return Promise.resolve(response);
  })
  .catch((error) => {
    if (error.status === 401) { //unauthorised
      log.debug(error, 'ChildProcessAgent message UNAUTHORISED');
      removeJwt(this.config);
      return this.login().then(() => this.request.apply(this, [repository, method].concat(params)));
    }

    log.error(error, 'ChildProcessAgent message ERROR');
    return Promise.resolve();
  });
};

module.exports = require('./MainProcessAgent'); // ChildProcessAgent;
