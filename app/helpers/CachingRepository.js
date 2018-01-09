const fs = require('fs');
const util = require('util');

const isObject = (x) => x != null && typeof x === 'object' && Array.isArray(x) === false;

const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const datastore = {
  root: `${__dirname}/../../.cache`,
  timeout: 200,

  put(cacheKey, data) {
    let path = `${datastore.root}/${cacheKey}`;

    return writeFile(path, data, 'utf8')
      .then(() => setTimeout(() => unlink(path), datastore.timeout));
  },

  get(cacheKey) {
    let path = `${datastore.root}/${cacheKey}`;

    return readFile(path, 'utf8');
  }
};

mkdir(datastore.root).catch(() => { /* dir exists */ });

const cache = (cacheKey, ds) => (data) => {
  if (data) {
    ds.put(cacheKey, JSON.stringify(data));
  }

  return data;
};

const callRemote = (repository, fn, args, cacheKey, ds) => () => {
  return fn.apply(repository, args)
    .then(cache(cacheKey, ds));
};

const checkCache = (cacheKey, ds) => {
  return ds.get(cacheKey)
    .then((data) => JSON.parse(data));
};

const wrap = (repository, method, prefix, ds) => (...args) => {
  let cacheKey = [].concat([prefix, method], args.map((x) => isObject(x) ? JSON.stringify(x) : x)).join(' ').trim().replace(/\s/g, '_');
  let fn = repository[method];

  return checkCache(cacheKey, ds)
    .catch(callRemote(repository, fn, args, cacheKey, ds));
};

function CachingRepository(Repository, config, agent, ds) {
  const repository = new Repository(config, agent);
  ds = ds || datastore;

  for (let method in repository) {
    this[method] = wrap(repository, method, Repository.name, ds);
  }
};

module.exports = CachingRepository;
