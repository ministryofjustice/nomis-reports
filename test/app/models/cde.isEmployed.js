const moment = require('moment');

const helpers = require('../../../app/models/helpers');

describe('cde/IEPLevels', () => {

  describe('When an offender has an individual schedule that indicates they are employed', () => {
    let input = {

      sysdate: moment('2019-11-19T00:00:00'),

      mainBooking: { bookingId: 155957 },

      individualSchedules: [
        {
          eventId: 46232172,
          eventType: 'TAP',
          eventSubType: 'OPA',
          eventStatus: 'SCH',
          eventStartDateTime: moment('2019-11-19T18:45:00'),
          eventEndDateTime: moment('2019-11-19T00:00:00'),
          bookingId: 155957,
          escortType: { code: 'U', description: 'Unescorted' }
        }
      ],
    };

    it('should indicate that the offender is employed', () => {
      let result = helpers.isEmployed(input);

      result.should.equal(true);
    });
  });

  describe('When an offender has a programme profile that indicates they are employed', () => {
    let input = {

      sysdate: moment('2019-11-19T00:00:00'),

      mainBooking: { bookingId: 155957 },

      programmeProfiles: [
        {
          bookingId: 155957,

          courseActivity: {
            courseActivityId: 82512,
            description: 'Resettlement Stage 1',
            scheduledStartDate: moment('2010-05-07T00:00:00'),
            scheduledEndDate: moment('2015-06-15T00:00:00'),
            active: true,
            outsideWork: true,
            schedules: []
          },

          agencyLocationId: 'UPI',
          offenderProgramStatus: 'END',
          offenderStartDate: moment('2010-07-03T00:00:00'),
          offenderEndDate: moment('2010-07-15T00:00:00'),
          suspended: false
        }
      ],
    };

    it('should indicate that the offender is employed', () => {
      let result = helpers.isEmployed(input);

      result.should.equal(true);
    });
  });

  describe('When an offender has a programme profile and an individual schedule that indicates they are employed', () => {
    let input = {

      sysdate: moment('2019-11-19T00:00:00'),

      mainBooking: { bookingId: 155957 },

      programmeProfiles: [
        {
          bookingId: 155957,

          courseActivity: {
            courseActivityId: 82512,
            description: 'Resettlement Stage 1',
            scheduledStartDate: moment('2010-05-07T00:00:00'),
            scheduledEndDate: moment('2015-06-15T00:00:00'),
            active: true,
            outsideWork: true,
            schedules: []
          },

          agencyLocationId: 'UPI',
          offenderProgramStatus: 'END',
          offenderStartDate: moment('2010-07-03T00:00:00'),
          offenderEndDate: moment('2010-07-15T00:00:00'),
          suspended: false
        }
      ],

      individualSchedules: [
        {
          eventId: 46232172,
          eventType: 'TAP',
          eventSubType: 'OPA',
          eventStatus: 'SCH',
          eventStartDateTime: moment('2019-11-19T18:45:00'),
          eventEndDateTime: moment('2019-11-19T00:00:00'),
          bookingId: 155957,
          escortType: { code: 'U', description: 'Unescorted' }
        }
      ],
    };

    it('should indicate that the offender is employed', () => {
      let result = helpers.isEmployed(input);

      result.should.equal(true);
    });
  });

});
