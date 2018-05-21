let should = require('chai').should();

const request = require('supertest');
const express = require('express');

const AgencyRepository = require('../../../app/repositories/AgencyRepository');

describe('Agency Repository', () => {
  let exampleSet = [
    { agencyId: 'ABC', agencyType: 'ABCabc' },
    { agencyId: 'DEF', agencyType: 'DEFdef' },
    { agencyId: 'GHI', agencyType: 'GHIghi' },
  ];
  let exampleRecord = { agencyId: 'TEST', agencyType: 'TESTtest' };

  let server = express();
  server.get('/agencies', (req, res) => res.status(200).json(exampleSet));
  server.get('/agencies/TEST', (req, res) => res.status(200).json(exampleRecord));

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

    let agencyRepository = new AgencyRepository(config, request(server));

    it('should retrieve a list of agencies from the remote', () =>
      agencyRepository.list()
        .then((data) => data.should.eql(exampleSet)));

    it('should retrieve an agency from the remote for a known agencyId', () =>
      agencyRepository.getDetails('TEST')
        .then((data) => data.should.eql(exampleRecord)));

    it('should return nothing if the agencyId is not known', () =>
      agencyRepository.getDetails('VOID')
        .then((data) => should.not.exist(data)));

    it('should return nothing if the agencyId is not included', () =>
      agencyRepository.getDetails()
        .then((data) => should.not.exist(data)));
  });
});
