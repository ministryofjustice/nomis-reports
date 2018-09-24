const moment = require('moment');

const helpers = require('../../../app/models/helpers');

describe('cde/DiaryDetails', () => {

  describe('When an offender has no future diary entries', () => {
    let input = {

      sysdate: moment('2018-09-18T00:00:00'),

      mainBooking: { bookingId: 155957 },

      diaryDetails: [
        {
          bookingId: 8131
        },
        {
          bookingId: 8131,
          movementDateTime: moment('2008-01-08T10:03:00'),
          movementReasonCode: 'CA'
        },
        {
          bookingId: 8131,
          movementDateTime: moment('2007-11-23T10:01:00'),
          movementReasonCode: 'CA'
        },
        {
          bookingId: 8131,
          movementDateTime: moment('2007-11-23T10:00:00'),
          movementReasonCode: 'CA'
        }
      ],
    };

    it('should not return any entries', () => {
      let result = helpers.getFutureDiaryDetails(input);

      result.length.should.equal(0);
    });
  });

});
