let should = require('chai').should();

const generateApiGatewayToken = require('../../../app/helpers/apiGatewayAuth');

describe('API Gateway Token Generation', () => {
  let fakeKey = [
    '-----BEGIN PRIVATE KEY-----',
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgPGJGAm4X1fvBuC1z',
    'SpO/4Izx6PXfNMaiKaS5RUkFqEGhRANCAARCBvmeksd3QGTrVs2eMrrfa7CYF+sX',
    'sjyGg+Bo5mPKGH4Gs8M7oIvoP9pb/I85tdebtKlmiCZHAZE5w4DfJSV6',
    '-----END PRIVATE KEY-----'
  ].join('\n');

  // easiest to base64 encode the private key file contents to pass in as an environment variable
  let base64FakeKey = new Buffer(fakeKey).toString('base64');

  it('should not throw an error if the private key is valid', () =>
    should.not.throw(() => generateApiGatewayToken('dummy', new Buffer(base64FakeKey, 'base64').toString('ascii'))())
  );

  it('should throw an error if the private key is not valid', () =>
    should.throw(() => generateApiGatewayToken('dummy', base64FakeKey)())
  );
});
