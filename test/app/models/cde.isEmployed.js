const moment = require('moment');

const helpers = require('../../../app/models/helpers');

describe('cde/EmploymentStatus', () => {

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

      sysdate: moment('2010-07-10T00:00:00'),

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

  describe('When an offender has two programme profile one of which indicates they were employed', () => {
    let input = {

      sysdate: moment('2019-11-19T00:00:00'),

      mainBooking: { bookingId: 155957 },

      programmeProfiles: [
        {
          bookingId: 155957,
          courseActivity: {
            courseActivityId: 61323,
            description: "Library_OUT",
            scheduledStartDate: moment('2008-07-24'),
            active: true,
            outsideWork: true
          },
          agencyLocationId: "PKI",
          offenderProgramStatus: "WAIT",
          suspended: false
        },
        {
          bookingId: 155957,
          courseActivity: {
            courseActivityId: 60589,
            description: "A LIFE WORTH LIVING",
            scheduledStartDate: moment('2007-07-24'),
            active: true,
            outsideWork: false
          },
          agencyLocationId: "PKI",
          offenderProgramStatus: "END",
          offenderStartDate: moment('2008-07-24'),
          offenderEndDate: moment('2008-07-24'),
          suspended: false
        }
      ],

      individualSchedules: [ ],
    };

    it('should indicate that the offender is employed', () => {
      let result = helpers.isEmployed(input);

      result.should.equal(false);
    });
  });

});
