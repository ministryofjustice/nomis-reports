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
    return this.agent.get('/').query(query).send();
  };

  TestRepository.prototype.getDetails = function (id, query) {
    return this.agent.get(`/${id}`).query(query).send();
  };

  TestRepository.prototype.getList = function (id, query) {
    return this.agent.get(`/${id}/path`).query(query).send();
  };

  describe('for the Elite 2 API', () => {
    let ds = {
      data: {},

      get(path) {
        path = path.replace(__dirname, '');

        return new Promise((resolve, reject) => this.data[path] ? resolve(this.data[path]) : reject(new Error('file does not exist')));
      },

      put(path, data) {
        path = path.replace(__dirname, '');
        this.data[path] = { path, data };

        return new Promise((resolve) => resolve(this.data[path]));
      }
    };

    let testRepository = new TestRepository(request(server));
    let cachingService = new CachingRepository(testRepository, ds);


    it('should store a list document in the cache', () =>
      cachingService.list()
        .then((data) => should.exist(data) && data.should.eql())
        .then(() => ds.data['TestRepository_list'].should.have.property('data', JSON.stringify()))
    );

    it('should store a response document in the cache', () =>
      cachingService.getDetails('TEST')
        .then((data) => should.exist(data) && data.should.eql())
        .then(() => ds.data['TestRepository_getDetails_TEST'].should.have.property('data', JSON.stringify()))
    );

    it('should not create a cache object if the response was not OK', () =>
      cachingService.getDetails('VOID')
        .then((data) => should.not.exist(data))
        .then(() => should.not.exist(ds.data['TestRepository_getDetails_VOID']))
    );

    it('should include path params in the cachekey', () =>
      cachingService.getList('FOO')
        .then((data) => should.exist(data) && data.should.eql())
        .then(() => ds.data['TestRepository_getList_FOO'].should.have.property('data', JSON.stringify()))
    );

    it('should include the search parameters in the cachekey', () =>
      cachingService.getList('ECHO', { q: 'BAR' })
        .then((data) => should.exist(data) && data.should.eql({ query: { q: 'BAR' }}))
        .then(() => ds.data['TestRepository_getList_ECHO_{"q":"BAR"}'].should.have.property('data', JSON.stringify({ query: { q: 'BAR' }})))
    );
  });
});
