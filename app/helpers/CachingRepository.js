const fs = require('fs');
const util = require('util');

const timeout = 200;
const root = `${__dirname}/../../.cache/`;

const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

mkdir(root);

const datastore = {
  write(path, data) {
    return writeFile(path, data, 'utf8');
  },

  read(path) {
    return readFile(path, 'utf8');
  }
};

const intercept = (cacheKey, ds) => (data) => {
  let f = `${root}/${cacheKey}`;

  ds.write(f, JSON.stringify(data), 'utf8')
    .then(() => setTimeout(() => unlink(f), timeout));

  return data;
};

const checkCache = (cacheKey, ds) => {
  return ds.read(`${root}/${cacheKey}`)
    .then((data) => JSON.parse(data));
};

const wrap = (repository, method, prefix, ds) => (...args) => {
  let cacheKey = [].concat([prefix, method], args).join(' ').trim().replace(/\s/g, '_');
  let fn = repository[method];

  return checkCache(cacheKey, ds)
    .catch(() => fn.apply(repository, args).then(intercept(cacheKey, ds)));
};

function CachingRepository(Repository, config, agent, ds) {
  const repository = new Repository(config, agent);
  ds = ds || datastore;

  for (let method in repository) {
    this[method] = wrap(repository, method, Repository.name, ds);
  }
};

module.exports = CachingRepository;
