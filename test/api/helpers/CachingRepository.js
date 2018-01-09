let should = require('chai').should();

const request = require('supertest');
const express = require('express');

const LocationRepository = require('../../../app/repositories/LocationRepository');
const LocationService = require('../../../app/services/LocationService');
const CachingRepository = require('../../../app/helpers/CachingRepository');

describe('A Caching Repository', () => {
  let exampleSet = [
    { locationId: 'ABC', description: 'ABCabc' },
    { locationId: 'DEF', description: 'DEFdef' },
    { locationId: 'GHI', description: 'GHIghi' },
  ];
  let exampleRecord = { locationId: 'TEST', description: 'TESTtest' };
  let exampleInmateList = [
    { offenderNo: 123, description: '123abcABC' },
  ];

  let server = express();
  server.get('/locations', (req, res) => res.status(200).json(exampleSet));
  server.get('/locations/TEST', (req, res) => res.status(200).json(exampleRecord));
  server.get('/locations/FOO/inmates', (req, res) => res.status(200).json(exampleInmateList));
  server.get('/locations/ECHO/inmates', (req, res) => res.status(200).json({ query: req.query }));

  describe('for the Elite 2 API', () => {
    let fakeKey = [
      '-----BEGIN PRIVATE KEY-----',
      'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgPGJGAm4X1fvBuC1z',
      'SpO/4Izx6PXfNMaiKaS5RUkFqEGhRANCAARCBvmeksd3QGTrVs2eMrrfa7CYF+sX',
      'sjyGg+Bo5mPKGH4Gs8M7oIvoP9pb/I85tdebtKlmiCZHAZE5w4DfJSV6',
      '-----END PRIVATE KEY-----'
    ].join('\n');

    let config = {
      elite2: {
        apiGatewayToken: 'LOCATION-REPO-TOKEN',
        apiGatewayPrivateKey: fakeKey,
        apiUrl: '',
      },
    };

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

    let cachingService = new LocationService(config, new CachingRepository(LocationRepository, config, request(server), ds));

    it('should store a list docuemnt in the cache', () =>
      cachingService.list()
        .then((data) => should.exist(data) && data.should.eql(exampleSet))
        .then(() => ds.data['LocationRepository_list'].should.have.property('data', JSON.stringify(exampleSet)))
    );

    it('should store a response document in the cache', () =>
      cachingService.getDetails('TEST')
        .then((data) => should.exist(data) && data.should.eql(exampleRecord))
        .then(() => ds.data['LocationRepository_getDetails_TEST'].should.have.property('data', JSON.stringify(exampleRecord)))
    );

    it('should not create a cache object if the response was not OK', () =>
      cachingService.getDetails('VOID')
        .then((data) => should.not.exist(data))
        .then(() => should.not.exist(ds.data['LocationRepository_getDetails_VOID']))
    );

    it('should include path params in the cachekey', () =>
      cachingService.listInmates('FOO')
        .then((data) => should.exist(data) && data.should.eql(exampleInmateList))
        .then(() => ds.data['LocationRepository_listInmates_FOO'].should.have.property('data', JSON.stringify(exampleInmateList)))
    );

    it('should include the search parameters in the cachekey', () =>
      cachingService.listInmates('ECHO', { q: 'BAR' })
        .then((data) => should.exist(data) && data.should.eql({ query: { q: 'BAR' }}))
        .then(() => ds.data['LocationRepository_listInmates_ECHO_{"q":"BAR"}'].should.have.property('data', JSON.stringify({ query: { q: 'BAR' }})))
    );
  });
});
