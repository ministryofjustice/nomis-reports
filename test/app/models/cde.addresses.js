const helpers = require('../../../app/models/helpers');

describe('cde/addresses', () => {
  describe('When an offender has several addresses with a single active usage', () => {
    let input = {
      addresses: [
        {
          addressId: 126759,
          addressUsages: [ { usage: "HOME", active: true } ]
        },
        {
          addressId: 126761,
          addressUsages: [ { usage: "RECEP", active: true } ]
        },
        {
          addressId: 126760,
          addressUsages: [ { usage: "RELEASE", active: true } ]
        }
      ]
    };

    it('Should find the home address', () => {
      helpers.getOffenderHomeAddress(input).should.have.property('addressId', 126759);
    });

    it('Should find the Reception address', () => {
      helpers.getOffenderReceptionAddress(input).should.have.property('addressId', 126761);
    });

    it('Should find the Discharge address', () => {
      helpers.getOffenderDischargeAddress(input).should.have.property('addressId', 126760);
    });
  });

  describe('When an offender has one address with a several active usages', () => {
    let input = {
      addresses: [
        {
          addressId: 126759,
          addressUsages: [
            { usage: "HOME", active: true },
            { usage: "RECEP", active: true },
            { usage: "RELEASE", active: true }
          ]
        }
      ]
    };

    it('Should find the home address', () => {
      helpers.getOffenderHomeAddress(input).should.have.property('addressId', 126759);
    });

    it('Should find the Reception address', () => {
      helpers.getOffenderReceptionAddress(input).should.have.property('addressId', 126759);
    });

    it('Should find the Discharge address', () => {
      helpers.getOffenderDischargeAddress(input).should.have.property('addressId', 126759);
    });
  });

  describe('When an offender has one address with no active usages', () => {
    let input = {
      addresses: [
        {
          addressId: 126759,
          addressUsages: [
            { usage: "HOME", active: false },
            { usage: "RECEP", active: false },
            { usage: "RELEASE", active: false }
          ]
        }
      ]
    };

    it('Should not find the home address', () => {
      helpers.getOffenderHomeAddress(input).should.not.have.property('addressId', 126759);
    });

    it('Should find the Reception address', () => {
      helpers.getOffenderReceptionAddress(input).should.not.have.property('addressId', 126759);
    });

    it('Should find the Discharge address', () => {
      helpers.getOffenderDischargeAddress(input).should.not.have.property('addressId', 126759);
    });
  });

  describe('When an offender has two home addresses, one active and one inactive', () => {
    let input = {
      addresses: [
        {
          addressId: 126759,
          addressUsages: [ { usage: "HOME", active: false }
          ]
        },
        {
          addressId: 126761,
          addressUsages: [ { usage: "HOME", active: true } ]
        }
      ]
    };

    it('Should find the first active home address', () => {
      helpers.getOffenderHomeAddress(input).should.have.property('addressId', 126761);
    });
  });

  describe('When an offender has two addresses each with one active and one inactive usage', () => {
    let input = {
      addresses: [
        {
          addressId: 126759,
          addressUsages: [
            { usage: "HOME", active: false },
            { usage: "RECEP", active: true }
          ]
        },
        {
          addressId: 126761,
          addressUsages: [
            { usage: "HOME", active: true },
            { usage: "RECEP", active: false }
          ]
        }
      ]
    };

    it('Should find the first active home address', () => {
      helpers.getOffenderHomeAddress(input).should.have.property('addressId', 126761);
    });

    it('Should find the first active reception address', () => {
      helpers.getOffenderReceptionAddress(input).should.have.property('addressId', 126759);
    });
  });
});
