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

      read(path) {
        return new Promise((resolve, reject) => this.data[path] ? resolve(this.data[path]) : reject(new Error('file does not exist')));
      },

      write(path, data) {
        this.data[path] = { path, data };

        return new Promise((resolve) => resolve(this.data[path]));
      }
    };

    let cachingService = new LocationService(config, new CachingRepository(LocationRepository, config, request(server), ds));

    it('should retrieve a list of locations from the remote', () =>
      cachingService.list()
        .then((data) => {
          should.exist(data);

          data.should.eql(exampleSet);
        })
        .then(() => {
          ds.data['../../.data/LocationRepository_list'].should.have.property('path', '../../.data/LocationRepository_list');

          ds.data['../../.data/LocationRepository_list'].should.have.property('data');
          ds.data['../../.data/LocationRepository_list'].data.should.eql(exampleSet);
        })
    );

/*
    it('should retrieve a location from the remote for a known locationId', () =>
      cachingService.getDetails('TEST')
        .then((data) => data.should.eql(exampleRecord)));

    it('should return nothing if the locationId is not known', () =>
      cachingService.getDetails('VOID')
        .then((data) => should.not.exist(data)));

    it('should retrieve a list of inmates from the remote for a known locationId', () =>
      cachingService.listInmates('FOO')
        .then((data) => data.should.eql(exampleInmateList)));

    it('should pass the search parameters to the remote', () =>
      cachingService.listInmates('ECHO', { q: 'BAR' })
        .then((data) => data.should.eql({ query: { q: 'BAR' }})));
*/
  });
});
