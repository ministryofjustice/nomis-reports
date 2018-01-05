let should = require('chai').should();

const request = require('supertest');
const express = require('express');

const CustodyStatusRepository = require('../../../app/repositories/CustodyStatusRepository');

describe('A CustodyStatus Repository', () => {
  let exampleSet = [
    { nomsId: 'X7777XX', custodyStatusCode: 'ACTIVE_IN' },
    { nomsId: 'Y8888YY', custodyStatusCode: 'ACTIVE_OUT' },
    { nomsId: 'Z9999ZZ', custodyStatusCode: 'IN_ACTIVE' },
  ];
  let exampleRecord = { nomsId: 'W6666WW', custodyStatusCode: 'ACTIVE_ESCP' };

  let server = express();
  server.get('/custody-statuses', (req, res) => res.status(200).json(exampleSet));
  server.get('/custody-statuses/W6666WW', (req, res) => res.status(200).json(exampleRecord));

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
        apiGatewayToken: 'CUSTODYSTATUS-REPO-TOKEN',
        apiGatewayPrivateKey: fakeKey,
        apiUrl: '',
      },
    };

    let custodyStatusRepository = new CustodyStatusRepository(config, request(server));

    it('should retrieve a list of custody statuses from the remote', () =>
      custodyStatusRepository.list()
        .then((data) => data.should.eql(exampleSet)));

    it('should retrieve a custody status from the remote for a known nomsId', () =>
      custodyStatusRepository.getDetails('W6666WW')
        .then((data) => data.should.eql(exampleRecord)));

    it('should return nothing if the nomsId is not known', () =>
      custodyStatusRepository.getDetails('VOID')
        .then((data) => should.not.exist(data)));
  });
});
