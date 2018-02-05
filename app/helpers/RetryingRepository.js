
const maxRetries = 5;

const shouldRetry = (err, retries) => {
  // 408 Request timeout
  // 429 Too many requests
  // 5xx Server Error
  if (retries < maxRetries && (err.code === 'ENOTFOUND' || err.status === 408 || err.status === 429 || err.status === 502)) {
    return true;
  }

  return false;
};

const retryInterval = (retry) => [ 100, 1000, 5000, 10000, 60000 ][retry];

const retry = (repository, method, args, retries) =>
  repository[method].apply(repository, args)
    .catch((err) => {
      let error = err.response && err.response.error || err;

      if (shouldRetry(error, retries)) {
        delete error.text;
        console.log(error);
        console.log('RETRYING', method, retries, args);

        return new Promise((resolve, reject) => {
          setTimeout(() =>
            retry(repository, method, args, ++retries).then((data) => resolve(data), (err) => reject(err)),
            retryInterval(retries));
        });
      }

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
