const log = require('../../server/log');

const retryInterval = (retry) => [ 500, 1000, 3000, 5000, 10000, 60000 ][retry];

const shouldRetry = (err, retries) => {
  // 408 Request timeout
  // 429 Too many requests
  // 5xx Server Error
  if (retryInterval(retries) > 0 && ~['ETIMEDOUT', 'ECONNABORTED', 'ENOTFOUND', 408, 429, 502].indexOf(err.code)) {
    return true;
  }

  return false;
};

const retry = (repository, method, args, retries) =>
  repository[method].apply(repository, args)
    .catch((err) => {
      let error = err.response && err.response.error || err;

      if (shouldRetry(error, retries)) {
        log.debug({ method, args: (method !== 'login' ? args : ['#','#','#']), retries }, 'RetryingRepository request RETRY');

        return new Promise((resolve, reject) => {
          setTimeout(() =>
            retry(repository, method, args, ++retries).then((data) => resolve(data), (err) => reject(err)),
            retryInterval(retries));
        });
      }

      log.debug({ method, args: (method !== 'login' ? args : ['#','#','#']), status: error.code, retries }, 'RetryingRepository request ERROR');

      delete error.text;
      return Promise.reject(error);
    });

const wrap = (repository, method) =>
  (...args) => retry(repository, method, args, 0);

function RetryingRepository(repository) {
  this.name = repository.name || repository.constructor.name;

  for (let method in repository) {
    this[method] = wrap(repository, method);
  }
};

module.exports = RetryingRepository;
