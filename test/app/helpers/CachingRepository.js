let should = require('chai').should();

const request = require('supertest');
const express = require('express');

const CachingRepository = require('../../../app/helpers/CachingRepository');

describe('Caching Repository', () => {

  let server = express();
  server.get('/', (req, res) => res.status(200).json({ path: '/' }));
  server.get('/TEST', (req, res) => res.status(200).json({ path: '/TEST' }));
  server.get('/FOO/path', (req, res) => res.status(200).json({ path: '/FOO/path' }));
  server.get('/ECHO/path', (req, res) => res.status(200).json({ path: '/ECHO/path', query: req.query }));

  function TestRepository(agent) {
    this.agent = agent;
  }

  TestRepository.prototype.list = function (query) {
    return this.agent.get('/').query(query).send().then(res => {
      return res.status === 404 ? undefined : res && res.body;
    });
  };

  TestRepository.prototype.getDetails = function (id, query) {
    return this.agent.get(`/${id}`).query(query).send().then(res => {
      return res.status === 404 ? undefined : res && res.body;
    });
  };

  TestRepository.prototype.getList = function (id, query) {
    return this.agent.get(`/${id}/path`).query(query).send().then(res => {
      return res.status === 404 ? undefined : res && res.body;
    });
  };

  describe('for the Elite 2 API', () => {
    let ds = {
      data: {},

      getStore(cacheName) {
        this.data[cacheName] = this.data[cacheName] || [];

        return this.data[cacheName];
      },

      put(cacheName, cacheKey, data) {
        return new Promise((resolve) => {
          this.getStore(cacheName).push({ cacheName, cacheKey, data });

          resolve();
        });
      },

      get(cacheName, cacheKey = '_') {
        return new Promise((resolve, reject) => {
          let found = this.getStore(cacheName).filter(x => x.cacheKey === cacheKey);

          found.length === 1 ? resolve(found[0].data) : reject(new Error());
        });
      }
    };

    let testRepository = new TestRepository(request(server));
    let cachingService = new CachingRepository(testRepository, ds);

    beforeEach(() => {
      ds.data = {};
    });

    it('should implement the wraped objects interface', () => {
      cachingService.should.have.property('list');
      cachingService.should.have.property('getDetails');
      cachingService.should.have.property('getList');
    });

    it('should return the correct response', () =>
      cachingService.list()
        .then((data) => {
          should.exist(data);
          data.should.eql({ path: '/' });
        })
    );

    it('should store a list documents in the cache', () =>
      cachingService.list()
        .then(() => ds.get('_TestRepository_list'))
        .then(cache => cache.should.have.property('path'))
    );

    it('should store a response document in the cache', () =>
      cachingService.getDetails('TEST')
        .then((data) => {
          should.exist(data);
          data.should.eql({ path: '/TEST' });
        })
        .then(() => ds.get('_TestRepository_getDetails', '_TEST'))
        .then(cache => cache.should.have.property('path', '/TEST'))
    );

    it('should retrieve a response document from the cache', () => {
      ds.put('_TestRepository_getDetails', '_TEST', { foo: 'bar' });

      return cachingService.getDetails('TEST')
        .then((data) => {
          should.exist(data);
          data.should.eql({ "foo": "bar" });
        })
        .then(() => ds.get('_TestRepository_getDetails', '_TEST'))
        .then(cache => cache.should.have.property('foo', 'bar'));
    });

    it('should not create a cache object if the response was not OK', () =>
      cachingService.getDetails('VOID')
        .then((data) => should.not.exist(data))
        .then(() => ds.get('_TestRepository_getDetails', '_VOID').catch((err) => Promise.resolve(err)))
        .then(err => err.should.be.instanceOf(Error))
    );

    it('should include path params in the cachekey', () =>
      cachingService.getList('FOO')
        .then((data) => {
          should.exist(data);
          data.should.eql({ path: '/FOO/path' });
        })
        .then(() => ds.get('_TestRepository_getList', '_FOO'))
        .then(cache => cache.should.have.property('path', '/FOO/path'))
    );

    it('should include the search parameters in the cachekey', () =>
      cachingService.getList('ECHO', { q: 'BAR' })
        .then((data) => {
          should.exist(data);
          data.should.eql({ path: '/ECHO/path', query: { 'q': 'BAR' } });
        })
        .then(() => ds.get('_TestRepository_getList', '_ECHO_{"q":"BAR"}'))
        .then(cache => {
          cache.should.have.property('path', '/ECHO/path');
          cache.should.have.property('query');
          cache.query.should.have.property('q', 'BAR');
        })
    );
  });
});
