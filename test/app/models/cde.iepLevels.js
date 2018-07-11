const moment = require('moment');

const helpers = require('../../../app/models/helpers');

describe('cde/IEPLevels', () => {

  describe('When an offender has two IEP levels with the same datetimes', () => {
    let input = {

      mainBooking: { bookingId: 16071 },

      ieps: [
        {
          bookingId: 16071, iepLevelSeq: 2, iepDateTime: moment('2010-05-12'),
          iepLevel: {
            iepLevel: { code: 'STD' }
          }
        },
        {
          bookingId: 16071, iepLevelSeq: 1, iepDateTime: '2010-05-12',
          iepLevel: {
            iepLevel: { code: 'BAS' }
          }
        }
      ],
    };

    it('should retrieve the one with the highest IEP Level sequence', () => {
      let result = helpers.getIEPLevel(input);
      result.should.have.property('iepLevel');
      result.iepLevel.should.have.property('code', 'STD');
    });
  });

  describe('When an offender has two IEP levels with the same dates and times that match the sequence', () => {
    let input = {

      mainBooking: { bookingId: 16071 },

      ieps: [
        {
          bookingId: 16071, iepLevelSeq: 2, iepDateTime: moment('2010-05-12T09:45:06'),
          iepLevel: {
            iepLevel: { code: 'STD' }
          }
        },
        {
          bookingId: 16071, iepLevelSeq: 1, iepDateTime: '2010-05-12T09:45:00',
          iepLevel: {
            iepLevel: { code: 'BAS' }
          }
        }
      ],
    };

    it('should  retrieve the most recent', () => {
      let result = helpers.getIEPLevel(input);
      result.should.have.property('iepLevel');
      result.iepLevel.should.have.property('code', 'STD');
    });
  });

  describe('When an offender has two IEP levels with the same dates but times that mismatch the sequence', () => {
    let input = {

      mainBooking: { bookingId: 16071 },

      ieps: [
        {
          bookingId: 16071, iepLevelSeq: 1, iepDateTime: moment('2010-05-12T09:45:06'),
          iepLevel: {
            iepLevel: { code: 'STD' }
          }
        },
        {
          bookingId: 16071, iepLevelSeq: 2, iepDateTime: '2010-05-12T09:45:00',
          iepLevel: {
            iepLevel: { code: 'BAS' }
          }
        }
      ],
    };

    it('should ignore time and retrieve the one with the highest IEP Level sequence', () => {
      let result = helpers.getIEPLevel(input);
      result.should.have.property('iepLevel');
      result.iepLevel.should.have.property('code', 'BAS');
    });
  });

});
