let should = require('chai').should();

const request = require('supertest');
const express = require('express');
/*
const LocationRepository = require('../../../app/repositories/LocationRepository');
const LocationService = require('../../../app/services/LocationService');
const ProcessAgent = require('../../../app/helpers/MainProcessAgent');

describe.skip('Location Service', () => {
  let exampleSet = [
    { locationId: 'ABC', locationType: 'ABCabc' },
    { locationId: 'DEF', locationType: 'DEFdef' },
    { locationId: 'GHI', locationType: 'GHIghi' },
  ];
  let exampleRecord = {
    locationId: 'TEST',
    locationType: 'TESTtest',
    description: 'TESTtest',
    userDescription: '',
    agencyId: 'LEI',
    currentOccupancy: 0,
    operationalCapacity: 0,
    locationUsage: '',
    locationPrefix: '',
    description: '',
  };

  let server = express();
  server.get('/locations', (req, res) => res.status(200).json(req.query.query ? [] : exampleSet));
  server.get('/locations/TEST', (req, res) => res.status(200).json(exampleRecord));
  server.get('/locations/VOID', (req, res) => res.status(404).send());

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
      location: (config) => new LocationRepository(config, request(server))
    });
    let locationService = new LocationService(config, processAgent);

    it('should retrieve a list of locations from the remote', () =>
      locationService.list()
        .then((data) => data.should.eql(exampleSet.map(x => ({
          id: `/locations/${x.locationId}`,
          type: `/locations/types/${x.locationType}`,
        })))));

    it('should retrieve a location from the remote for a known locationId', () =>
      locationService.getDetails('TEST')
        .then((data) => data.should.eql({
          id: `/locations/${exampleRecord.locationId}`,
          type: `/locations/types/${exampleRecord.locationType}`,
          label: exampleRecord.userDescription,
          agency: `/agencies/${exampleRecord.agencyId}`,
          currentOccupancy: exampleRecord.currentOccupancy,
          operationalCapacity: exampleRecord.operationalCapacity,
          parentLocation: undefined,
          usage: exampleRecord.locationUsage,
          code: exampleRecord.locationPrefix,
          shortCode: exampleRecord.description,
        })));

    it('should return nothing if the locationId is not known', () =>
      locationService.getDetails('VOID')
        .catch(err => {
          should.exist(err);

          err.status.should.equal(404);
          err.message.should.contain('Location');
          err.message.should.contain('VOID');
          err.message.should.contain('not found');
        })
    );
  });
});
*/
