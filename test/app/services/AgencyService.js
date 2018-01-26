let should = require('chai').should();

const request = require('supertest');
const express = require('express');

const AgencyRepository = require('../../../app/repositories/AgencyRepository');
const AgencyService = require('../../../app/services/AgencyService');

describe('An Agency Service', () => {
  let exampleSet = [
    { agencyId: 'ABC', description: 'ABCabc' },
    { agencyId: 'DEF', description: 'DEFdef' },
    { agencyId: 'GHI', description: 'GHIghi' },
  ];
  let exampleRecord = { agencyId: 'TEST', name: 'TESTtest' };
  let exampleLocations = [
    { locationId: 'ABC', description: 'ABCabc' },
    { locationId: 'DEF', description: 'DEFdef' },
    { locationId: 'GHI', description: 'GHIghi' },
  ];
  let exampleContactDetailsRecord = {
    agencyId: 'TEST',
    name: 'TESTtest',
    tel: '0161 999 9999',
  };

  let server = express();
  server.get('/agencies', (req, res) => res.status(200).json(exampleSet));
  server.get('/agencies/TEST', (req, res) => res.status(200).json(exampleRecord));
  server.get('/agencies/TEST/locations', (req, res) => res.status(200).json(exampleLocations));
  server.get('/agencies/TEST/contactDetails', (req, res) => res.status(200).json(exampleContactDetailsRecord));

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
        apiGatewayToken: 'AGENCY-REPO-TOKEN',
        apiGatewayPrivateKey: fakeKey,
        apiUrl: '',
      },
    };

    let agencyRepository = new AgencyRepository(config, request(server));
    let agencyService = new AgencyService(config, agencyRepository);

    it('should retrieve a list of agencies from the remote', () =>
      agencyService.list()
        .then((data) => data.should.eql(exampleSet)));

    it('should retrieve an agency from the remote', () =>
      agencyService.getDetails('TEST')
        .then((data) => data.should.eql(exampleRecord)));

    it('should return nothing if not exist', () =>
      agencyService.getDetails('VOID')
        .then((data) => should.not.exist(data)));
  });
});
