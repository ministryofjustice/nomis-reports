let should = require('chai').should();

const request = require('supertest');
const express = require('express');
/*
const AgencyRepository = require('../../../app/repositories/AgencyRepository');
const LocationRepository = require('../../../app/repositories/LocationRepository');
const AgencyService = require('../../../app/services/AgencyService');
const ProcessAgent = require('../../../app/helpers/MainProcessAgent');

describe.skip('Agency Service', () => {
  let exampleSet = [
    { agencyId: 'ABC', agencyType: 'HSHOSP' },
    { agencyId: 'DEF', agencyType: 'CRT' },
    { agencyId: 'GHI', agencyType: 'INST' },
  ];
  let exampleRecord = {
    agencyId: 'TEST',
    agencyType: 'INST',
    description: 'TEST INSTITUTION',
    locations: [],
  };

  let server = express();
  server.get('/agencies', (req, res) => res.status(200).json(exampleSet));
  server.get('/agencies/TEST', (req, res) => res.status(200).json(exampleRecord));
  server.get('/locations', (req, res) => res.status(200).json(exampleRecord.locations));

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

    let processAgent = new ProcessAgent(config, {
      agency: (config) => new AgencyRepository(config, request(server)),
      location: (config) => new LocationRepository(config, request(server))
    });
    let agencyService = new AgencyService(config, processAgent);

    it('should retrieve a list of agencies from the remote', () =>
      agencyService.list()
        .then((data) => data.should.eql(exampleSet.map(x => ({
          id: `/agencies/${x.agencyId}`,
          type: `/agencies/types/${x.agencyType}`,
        }))))
    );

    it('should retrieve an agency from the remote', () =>
      agencyService.getDetails('TEST')
        .then((data) => data.should.eql({
          id: `/agencies/${exampleRecord.agencyId}`,
          type: `/agencies/types/${exampleRecord.agencyType}`,
          label: exampleRecord.description,
          locations: [],
        }))
    );

    it('should return nothing if not exist', () =>
      agencyService.getDetails('VOID')
        .catch(err => {
          should.exist(err);

          err.status.should.equal(404);
          err.message.should.contain('Agency');
          err.message.should.contain('VOID');
          err.message.should.contain('not found');
        })
    );
  });
});
*/
