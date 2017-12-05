const request = require('supertest');
const express = require('express');

const apiHealthCheck = require('../../../api/helpers/apiHealthCheck');

describe('Remote API health checker', () => {
  let config = {
    timeout: {
      response: 2000,
      deadline: 2500
    }
  };

  let server = express();
  server.get('/', (req, res) => res.status(200).json({ hello: 'world' }));
  server.get('/alternative', (req, res) => res.status(200).json({ hello: 'universe' }));

  it('should work even without an auth function', () => {
    let func = apiHealthCheck(request(server), undefined, config, '/', 'fake-api', 'Fake API');
    func({ error: () => {}}).then((response) => response.should.have.property('name', 'fake-api'));
  });

  it('should work even without config', () => {
    let func = apiHealthCheck(request(server), () => 'dummy', undefined, '/', 'fake-api', 'Fake API');
    func({ error: () => {}}).then((response) => response.should.have.property('name', 'fake-api'));
  });

  it('should add the properties of the response', () => {
    let func = apiHealthCheck(request(server), undefined, undefined, '/', 'fake-api', 'Fake API');
    func({ error: () => {}}).then((response) => response.should.have.property('hello', 'world'));
  });

  it('should add the name to the response', () => {
    let func = apiHealthCheck(request(server), undefined, undefined, '/', 'fake-api', 'Fake API');
    func({ error: () => {}}).then((response) => response.should.have.property('name', 'fake-api'));
  });

  it('should use the auth function when available', () => {
    let authConfig = Object.assign({
      apiGatewayToken: 'fake-token',
      apiGatewayPrivateKey: 'fake-key'
    }, config);

    let flag = '';
    let testFunc = (x, y) => flag = x + '-' + y;

    let authFunc = apiHealthCheck(request(server), testFunc, authConfig, '/', 'secure-fake-api', 'Secure Fake API');

    authFunc({ error: () => {}}).then(() => flag.should.equal('fake-token-fake-key'));
  });

  it('should make a request of the correct url', () => {
    let func = apiHealthCheck(request(server), undefined, undefined, '/alternative', 'fake-api', 'Fake API');
    func({ error: () => {}}).then((response) => response.should.have.property('hello', 'universe'));
  });
});
