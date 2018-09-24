let should = require('chai').should();

const express = require('express');
const bodyParser = require('body-parser');
const supertest = require('supertest');

const server = express();
server.get('/fake-api/world', (req, res) => res.status(200).json({ hello: 'world' }));
server.get('/fake-api/universe', (req, res) => res.status(200).json({ hello: 'universe' }));
server.get('/fake-api/header/:name', (req, res) => res.status(200).json({ [req.params.name]: req.get(req.params.name) }));
server.get('/fake-api/:param', (req, res) => res.status(200).json(req.params));
server.get('/fake-api/:p1/:p2', (req, res) => res.status(200).json(req.params));
server.use(bodyParser.json());
server.post('/fake-api/echo', (req, res) => res.status(200).json(req.body));

let fakeKey = [
  '-----BEGIN PRIVATE KEY-----',
  'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgPGJGAm4X1fvBuC1z',
  'SpO/4Izx6PXfNMaiKaS5RUkFqEGhRANCAARCBvmeksd3QGTrVs2eMrrfa7CYF+sX',
  'sjyGg+Bo5mPKGH4Gs8M7oIvoP9pb/I85tdebtKlmiCZHAZE5w4DfJSV6',
  '-----END PRIVATE KEY-----'
].join('\n');

function authHeaderPlugin (tokenGenerator = () => 'API-GATEWAY-TOKEN') {
  return (request) => {
    request.set('Authorization', 'Bearer ' + tokenGenerator());

    return request;
  };
}

describe('API Agent', () => {

  describe('for Generic APIs', () => {
    const apiAgent = require('../../../app/helpers/apiAgent');
    const simpleApiAgent =  apiAgent(supertest(server));

    let i = 0;
    const incrementalApiAgent = apiAgent(supertest(server), [authHeaderPlugin(() => ++i)]);

    it('Should be able to make a simple GET request', () =>
      simpleApiAgent.get('/fake-api/world')()
        .then((response) => response.body.hello.should.equal('world')));

    it('Should be able to make a paramerised GET request', () =>
      simpleApiAgent.get('/fake-api/:id')({ id: 'harvard' })
        .then((response) => response.body.should.eql({ param: 'harvard' })));

    it('Should be able to make a multi paramerised GET request', () =>
      simpleApiAgent.get('/fake-api/:id/:id2')({ id: 'harvard', id2: 'university' })
        .then((response) => response.body.should.eql({ p1: 'harvard', p2: 'university' })));

    it('Should be able to make a simple GET request to an alternative route', () =>
      simpleApiAgent.get('/fake-api/universe')()
        .then((response) => response.body.hello.should.equal('universe')));

    it('Should post the body to the endpoint', () =>
      simpleApiAgent.post('/fake-api/echo')({ foo: 'bar'})
        .then((response) => response.body.should.eql({ foo: 'bar'})));

    const authHeaderApiAgent = apiAgent(supertest(server), [ authHeaderPlugin() ]);
    it('Should include the Authorization header when the gatewayAuthTokenGenerator is used', () =>
      authHeaderApiAgent.get('/fake-api/header/Authorization')()
        .then((response) => response.body.Authorization.should.equal('Bearer API-GATEWAY-TOKEN')));

    it('Should call the tokenGenerator for each new request', () => {
      var x;
      let getIncrementalAuthorizationHeader = incrementalApiAgent.get('/fake-api/header/Authorization');

      return getIncrementalAuthorizationHeader()
          .then((response) => x = response.body.Authorization)
          .then(getIncrementalAuthorizationHeader()
          .then((response) => x = response.body.Authorization)
          .then(getIncrementalAuthorizationHeader()
          .then((response) => x = response.body.Authorization)
          .then(getIncrementalAuthorizationHeader()
          .then((response) => x = response.body.Authorization)
          .then(() => x.should.equal('Bearer 4')))));
    });
  });
});
