const Datastore = require('nedb');
const log = require('../../server/log');

const isObject = (x) => x != null && typeof x === 'object' && Array.isArray(x) === false;

const datastore = {
  root: {},
  timeout: 1000 * 60 * 60 * 24, // 1sec -> 60secs -> 60mins -> 0hrs -> 0days

  getStore(cacheName) {
    this.root[cacheName] = this.root[cacheName] || new Datastore({
      filename: `.cache/${cacheName}.db`,
      autoload: true,
      timestampData: true
    });

    this.root[cacheName]
      .ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: this.timeout });

    return this.root[cacheName];
  },

  put(cacheName, cacheKey, data) {
    return new Promise((resolve) => {
      let doc = Object.assign({ _id: cacheKey, createdAt: new Date() }, { data });

      this.getStore(cacheName).insert(doc, () => resolve());
    });
  },

  get(cacheName, cacheKey) {
    return new Promise((resolve, reject) => {
      this.getStore(cacheName)
          .findOne({ _id: cacheKey }, (err, doc) => {
            if (err || !doc) {
              return reject(err);
            }

            resolve(doc.data);
          });
    });
  }
};

const cache = (cacheName, cacheKey, ds) => (data) => {
  if (data) {
    ds.put(cacheName, cacheKey, data);
  }

  return data;
};

const callRemote = (repository, fn, args, cacheName, cacheKey, ds) => () =>
  fn.apply(repository, args).then(cache(cacheName, cacheKey, ds));

const checkCache = (cacheName, cacheKey, ds) =>
  ds.get(cacheName, cacheKey);

const wrap = (repository, method, prefix, ds) => (...args) => {
  let cacheName = '_' + [prefix, method].join(' ').trim().replace(/\s/g, '_');
  let cacheKey = '_' + args.map((x) => isObject(x) ? JSON.stringify(x) : x).join(' ').trim().replace(/\s/g, '_');
  let fn = repository[method];

  log.debug(cacheName, cacheKey, args);

  return checkCache(cacheName, cacheKey, ds)
    .catch(callRemote(repository, fn, args, cacheName, cacheKey, ds));
};

function CachingRepository(repository, ds) {
  ds = ds || datastore;
  let name = this.name = repository.name || repository.constructor.name;

  for (let method in repository) {
    this[method] = wrap(repository, method, name, ds);
  }
};

module.exports = CachingRepository;
