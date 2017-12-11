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

describe('API Health', () => {
  describe('with downstream dependencies', () => {
    let server;
    before((done) => {
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
        done();
      });
    });

    it('should return a 200 response with some content', () =>
      request(server)
        .get('/health')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          res.body.should.have.property('version');
          res.body.should.have.property('uptime');
          res.body.should.have.property('healthy', true);
          res.body.should.have.property('status', 'UP');
          res.body.should.have.property('checks');
          res.body.checks.should.have.property('nomis-api');
          res.body.checks.should.have.property('elite2-api');
        })
        .catch((err) => console.log(err)));
  });

  describe('with no downstream dependencies', () => {
    let server;
    before((done) => {
      app({}, log, (err, _server) => {
        if (err) return done(err);
        server = _server;
        done();
      });
    });

    it('should return a 200 response with some content', () =>
      request(server)
        .get('/health')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          res.body.should.have.property('version');
          res.body.should.have.property('uptime');
          res.body.should.have.property('healthy', true);
          res.body.should.have.property('status', 'UP');
          res.body.should.have.property('checks');
        })
        .catch((err) => console.log(err)));
  });
});
