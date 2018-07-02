const modelHelpers = require('../../../app/models/helpers');


describe('cde/mainBooking', () => {
  describe('When the order of the bookings has the main booking first', () => {
    let input = {
      offenderId: 1013128,

      bookings: [
        {
          bookingId: 8131,
          bookingNo: "BM001",
          offenderId: 1013128,
          rootOffenderId: 1013128,
          bookingSequence: 2,
        },
        {
          bookingId: 8130,
          bookingNo: "BM001",
          offenderId: 1013128,
          rootOffenderId: 1013128,
          bookingSequence: 1,
        },
        {
          bookingId: 8100,
          bookingNo: "BM002",
          offenderId: 1021466,
          rootOffenderId: 1013128,
        },
      ],
    };

    let result = modelHelpers.getMainBooking(input);

    it('Should select the offender\'s mainBooking', () => {
      result.should.have.property('bookingId', input.bookings[0].bookingId);
    });

    it('Should have rootOffenderIds that match the root offender', () => {
      result.should.have.property('rootOffenderId', input.offenderId);
    });
  });
});
