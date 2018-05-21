let should = require('chai').should();

const request = require('supertest');
const express = require('express');

const LocationRepository = require('../../../app/repositories/LocationRepository');

describe('Location Repository', () => {
  let exampleSet = [
    { locationId: 'ABC', description: 'ABCabc' },
    { locationId: 'DEF', description: 'DEFdef' },
    { locationId: 'GHI', description: 'GHIghi' },
  ];
  let exampleRecord = { locationId: 'TEST', description: 'TESTtest' };

  let server = express();
  server.get('/locations', (req, res) => res.status(200).json(exampleSet));
  server.get('/locations/TEST', (req, res) => res.status(200).json(exampleRecord));

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
        apiUrl: '',
        apiGatewayToken: 'LOCATION-REPO-TOKEN',
        apiGatewayPrivateKey: fakeKey,
        oauth: {
          grantType: 'client_credentials',
          username: 'x_trusted_client',
          password: 'x_client_password',
        }
      }
    };

    let locationRepository = new LocationRepository(config, request(server));

    it('should retrieve a list of locations from the remote', () =>
      locationRepository.list()
        .then((data) => data.should.eql(exampleSet)));

    it('should retrieve a location from the remote for a known locationId', () =>
      locationRepository.getDetails('TEST')
        .then((data) => data.should.eql(exampleRecord)));

    it('should return nothing if the locationId is not known', () =>
      locationRepository.getDetails('VOID')
        .then((data) => should.not.exist(data)));
  });
});
