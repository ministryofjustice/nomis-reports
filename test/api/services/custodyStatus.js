const request = require('supertest');
const express = require('express');

const custodyStatusService = require('../../../app/services/custodyStatus');

describe('Elite 2 List Custody Status Service', () => {
  let config = {
    timeout: {
      response: 2000,
      deadline: 2500
    },

    apiUrl: '',
  };

  let server = express();
  server.get('/custody-status', (req, res) => res.status(200).json([
    { offenderNo: 'A1234BC', custodyStatus: 'ACTIVE_IN' },
    { offenderNo: 'C4321BA', custodyStatus: 'ACTIVE_OUT' },
    { offenderNo: 'Z9999ZZ', custodyStatus: 'IN_ACTIVE' },
  ]));

  let custodyStatusAgent = custodyStatusService(request(server), config);

  it('should return a response from the server', () => {
    return custodyStatusAgent.listCustodyStatuses().then((response) => response.should.have.property('length', 3));
  });
});
