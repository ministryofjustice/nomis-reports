const request = require('supertest');
const express = require('express');

const apiHealthCheck = require('../../../app/services/healthCheck');
const apiAgent = require('../../../app/helpers/apiAgent');

describe('Health Check', () => {
  let server = express();
  server.get('/test/version', (req, res) => res.status(200).json({ hello: 'world' }));
  server.get('/test/health', (req, res) => res.status(200).json({ hello: 'galaxy' }));
  server.get('/test/info', (req, res) => res.status(200).json({ hello: 'universe' }));

  let config = {
    apiUrl: '/test'
  };

  it('should make a request of /info/health', () =>
    apiHealthCheck(apiAgent(request(server)), 'fake-api', config).health()
      .then((response) => response.should.have.property('hello', 'galaxy')));

  it('should make a request of /info/health', () =>
    apiHealthCheck(apiAgent(request(server)), 'fake-api', config).info()
      .then((response) => response.should.have.property('hello', 'universe')));

  it('should make a request of /version', () =>
    apiHealthCheck(apiAgent(request(server)), 'fake-api', config).version()
      .then((response) => response.should.have.property('hello', 'world')));

  it('should work even without timeout options', () =>
    apiHealthCheck(apiAgent(request(server)), 'expected-api', config).version()
      .then((response) => response.should.have.property('name', 'expected-api')));

  it('should add the properties of the response', () =>
    apiHealthCheck(apiAgent(request(server)), 'fake-api', config).version()
      .then((response) => response.should.have.property('hello', 'world')));

  it('should add the name to the response', () =>
    apiHealthCheck(apiAgent(request(server)), 'fake-api', config).version()
      .then((response) => response.should.have.property('name', 'fake-api')));
});
