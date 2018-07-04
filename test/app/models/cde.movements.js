const helpers = require('../../../app/models/helpers');

describe('cde/movements', () => {
  /*
  ['offenderTransfers', helpers.getOffenderTransfers],
  ['firstOffenderTransfer', helpers.getFirstOffenderTransfer],
  ['lastOffenderTransfer', helpers.getLastOffenderTransfer],
  ['pendingOffenderTransfer', helpers.getPendingOffenderTransfer],

  ['lastOffenderMovement', helpers.getLastOffenderMovement],
  ['firstOffenderOutMovement', helpers.getFirstOffenderOutMovement],
  */

  describe('When the offender has no OUT movement associated with the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 9408,
      },

      movements: [
        {
          bookingId: 9408,
          movementDateTime: "2008-10-02T11:53:34",
          movementDirection: "IN",
          fromAgencyLocationId: "CHCHMC",
          toAgencyLocationId: "ALI"
        }
      ],

    };

    it('should not retrieve a movement', () => {
      helpers.getFirstOffenderOutMovement(input).should.not.have.property('movementDateTime');
    });
  });

  describe('When the offender has an OUT movement not associated with the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 9408,
      },

      movements: [
        {
          bookingId: 9407,
          movementDateTime: "2008-10-02T11:51:35",
          movementDirection: "OUT",
          fromAgencyLocationId: "ALI",
          toAgencyLocationId: "OUT"
        }
      ],

    };

    it('should not retrieve a movement', () => {
      helpers.getFirstOffenderOutMovement(input).should.not.have.property('movementDateTime');
    });
  });

  describe('When the offender has an OUT movement associated with the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 9408,
      },

      movements: [
        {
          bookingId: 9408,
          movementDateTime: "2008-10-02T11:51:35",
          movementDirection: "OUT",
          fromAgencyLocationId: "ALI",
          toAgencyLocationId: "OUT"
        }
      ],

    };

    it('should retrieve a movement', () => {
      helpers.getFirstOffenderOutMovement(input).should.have.property('movementDateTime', '2008-10-02T11:51:35');
    });
  });

});
