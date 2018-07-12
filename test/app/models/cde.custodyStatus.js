const helpers = require('../../../app/models/helpers');

describe('cde/custodyStatus', () => {
  describe('Using the main booking for and active prisoner', () => {
    let input = {

      mainBooking: {
        activeFlag: true,
        statusReason: "ADM-INT",
        inOutStatus: "IN",
        bookingSequence: 1,
      }
    };

    it('Should calculate the custody status correctly', () => {
      helpers.getCustodyStatus(input).should.equal('Active-In');
    });
  });

  describe('Using the main booking for and active prisoner', () => {
    let input = {

      mainBooking: {
        activeFlag: false,
        statusReason: "REL-ESCP",
        inOutStatus: "OUT",
        bookingSequence: 1,
      }
    };

    it('Should calculate the custody status correctly', () => {
      helpers.getCustodyStatus(input).should.equal('Active-UAL');
    });
  });

  /*
  */
});
