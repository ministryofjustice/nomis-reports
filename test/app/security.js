const express = require('express');
const router = express.Router();

const request = require('supertest');

const app = require('../../server/app');
const log = require('../../server/log');

let fakeKey = [
  '-----BEGIN PRIVATE KEY-----',
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgPGJGAm4X1fvBuC1z',
  'SpO/4Izx6PXfNMaiKaS5RUkFqEGhRANCAARCBvmeksd3QGTrVs2eMrrfa7CYF+sX',
  'sjyGg+Bo5mPKGH4Gs8M7oIvoP9pb/I85tdebtKlmiCZHAZE5w4DfJSV6',
  '-----END PRIVATE KEY-----'
].join('\n');

describe('API Security', () => {
  let server;
  let paths = [ 'get', 'post', 'put', 'delete' ];

  before((done) => {
    paths.forEach((method) =>
      router[ method ](`/${method}`, (req, res) => res.json({ hello: 'world' })));

    let config = {
      nomis: {
        apiUrl: '',
        apiGatewayToken: 'NOMIS-API-TOKEN',
        apiGatewayPrivateKey: fakeKey,
      },

      elite2: {
        apiUrl: '',
        apiGatewayToken: 'ELITE2-API-TOKEN',
        apiGatewayPrivateKey: fakeKey,
      }
    };

    app(config, log, (err, _server) => {
      if (err) return done(err);
      server = _server;

      server.use('/tests', router);

      done();
    }, false);
  });

  it('should include the "X-Frame-Options" header in responses from each url', () => {
    return Promise.all(paths.map((method) =>
      request(server)[method](`/tests/${method}`)
        .set('Accept', 'application/json')
        .expect('X-Frame-Options', /Deny/)
        .expect(200)
    ));
  });

  it('should specify private cache control on routes', () => {
    return Promise.all(paths.map((method) =>
      request(server)[method](`/tests/${method}`)
        .set('Accept', 'application/json')
        .expect('cache-control', /no-store/)
        .expect('cache-control', /no-cache/)
        .expect('cache-control', /must-revalidate/)
        .expect(200)
    ));
  });

  it('should specify pragma cache control on routes', () => {
    return Promise.all(paths.map((method) =>
      request(server)[method](`/tests/${method}`)
        .set('Accept', 'application/json')
        .expect('pragma', /no-cache/)
        .expect(200)
    ));
  });

  it('should specify expires header set to "0" on routes', () => {
    return Promise.all(paths.map((method) =>
      request(server)[method](`/tests/${method}`)
        .set('Accept', 'application/json')
        .expect('expires', /0/)
        .expect(200)
    ));
  });

  it('should specify a same-origin referrer policy on routes', () => {
    return Promise.all(paths.map((method) =>
      request(server)[method](`/tests/${method}`)
        .set('Accept', 'application/json')
        .expect('Referrer-Policy', /same-origin/)
        .expect(200)
    ));
  });
});
