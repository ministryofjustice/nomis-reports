const helpers = require('../../../app/models/helpers');

describe('cde/mostRecentConviction', () => {
  describe('When court events list contains a conviction', () => {
    let input = {

      mainBooking: {
        bookingId: 9740,
      },

      courtEvents: [
        {
          eventId: 993558,
          bookingId: 9740,
          startDateTime: "2008-10-23T10:00:00",
          agencyLocationId: "ABRYMC",

          courtEventCharges: [
            {
              chargeId: 18101,
              bookingId: 9740,

            }
          ]
        },
        {
          eventId: 993546,
          bookingId: 9740,
          startDateTime: "2008-10-23T10:00:00",
          agencyLocationId: "EASBMC",
          outcomeReasonCode: '1002',

          courtEventCharges: [
            {
              chargeId: 18095,
              bookingId: 9740,

              sentences: [
                {
                  bookingId: 9740,
                  sentenceSequenceNumber: 1,
                }
              ]
            }
          ]
        },
        {
          eventId: 993543,
          bookingId: 9740,
          startDateTime: "2008-10-15T10:00:00",
          agencyLocationId: "ABRYMC",

          courtEventCharges: [
            {
              chargeId: 18093,
              bookingId: 9740,

            }
          ]
        },
      ]
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.have.property('eventId', 993546);
      result.should.have.property('agencyLocationId', 'EASBMC');
    });
  });

  describe('When court events list contains 5 events', () => {
    let input = {

      mainBooking: { bookingId: 8134 },

      courtEvents: [
        {
          eventId: 581389, bookingId: 8134, startDateTime: "2008-02-26T10:04:00",
          outcomeReasonCode: '1002',
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        },
        {
          eventId: 581391, bookingId: 8134, startDateTime: "2007-08-31T10:03:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        },
        {
          eventId: 584549, bookingId: 8134, startDateTime: "2007-08-31T10:00:00",
        },
        {
          eventId: 581392, bookingId: 8134, startDateTime: "2007-07-18T10:01:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        },
        {
          eventId: 581390, bookingId: 8134, startDateTime: "2007-07-18T10:00:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.have.property('eventId', 581389);
    });
  });

  describe('When court events list contains 5 events', () => {
    let input = {

      mainBooking: { bookingId: 8134 },

      courtEvents: [
        {
          eventId: 581389, bookingId: 8134, startDateTime: "2008-02-26T10:04:00",
          outcomeReasonCode: '1002',
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        },
        {
          eventId: 581391, bookingId: 8134, startDateTime: "2007-08-31T10:03:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        },
        {
          eventId: 584549, bookingId: 8134, startDateTime: "2007-08-31T10:00:00",
        },
        {
          eventId: 581392, bookingId: 8134, startDateTime: "2007-07-18T10:01:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        },
        {
          eventId: 581390, bookingId: 8134, startDateTime: "2007-07-18T10:00:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.have.property('eventId', 581389);// FR4791
    });
  });

  describe('When court event contains a valid offence', () => {
    let input = {

      mainBooking: { bookingId: 8134 },

      courtEvents: [
        {
          eventId: 581389, bookingId: 8134, startDateTime: "2008-02-26T10:04:00",
          outcomeReasonCode: '1002',
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.have.property('eventId', 581389);// FR4791
    });
  });

  describe('When court event does not have an outcome reason code', () => {
    let input = {

      mainBooking: { bookingId: 8134 },

      courtEvents: [
        {
          eventId: 581389, bookingId: 8134, startDateTime: "2008-02-26T10:04:00",
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.not.have.property('eventId', 581389);// FR4791
    });
  });

  describe('When court event does not have an sentence', () => {
    let input = {

      mainBooking: { bookingId: 8134 },

      courtEvents: [
        {
          eventId: 581389, bookingId: 8134, startDateTime: "2008-02-26T10:04:00",
          outcomeReasonCode: '1002',
          courtEventCharges: [
            {
              chargeId: 16505, bookingId: 8134
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.not.have.property('eventId', 581389);// FR4791
    });
  });

  describe('When the second court event charge has a sentence', () => {
    let input = {

      mainBooking: { bookingId: 8134 },

      courtEvents: [
        {
          eventId: 581389, bookingId: 8134, startDateTime: "2008-02-26T10:04:00",
          outcomeReasonCode: '1002',
          courtEventCharges: [
            {
              chargeId: 16507, bookingId: 8134
            },
            {
              chargeId: 16505, bookingId: 8134,
              sentences: [
                { bookingId: 8134, sentenceSequenceNumber: 1, isActive: true }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify a conviction', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.have.property('eventId', 581389);// FR4791
    });
  });

});
