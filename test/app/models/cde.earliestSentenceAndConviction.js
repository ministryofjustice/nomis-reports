const helpers = require('../../../app/models/helpers');

describe('cde/cde.earliestSentenceAndConviction', () => {
  describe('When court events list contains a conviction', () => {
    let input = {

      mainBooking: {
        bookingId: 14622,
      },

      courtEvents: [
        {
          eventId: 2263804,
          bookingId: 14622,
          startDateTime: "2010-02-19T10:03:00",

          courtEventCharges: [
            {
              chargeId: 22601,
              bookingId: 14622,

              resultCodes: [
                {
                  conviction: true
                }
              ],

              sentences: [
                {
                  isActive: true,
                  startDate: "2013-02-19",
                }
              ]
            }
          ]
        },
        {
          eventId: 2263803,
          bookingId: 14622,
          startDateTime: "2011-02-19T10:01:00",

          courtEventCharges: [
            {
              chargeId: 22601,
              bookingId: 14622,

              resultCodes: [
                {
                  conviction: true
                }
              ],

              sentences: [
                {
                  isActive: true,
                  startDate: "2012-02-19",
                }
              ]
            }
          ]
        },
        {
          eventId: 2263830,
          bookingId: 14622,
          startDateTime: "2012-02-19T10:00:00",

          courtEventCharges: [
            {
              chargeId: 22611,
              bookingId: 14622,

              resultCodes: [
                {
                  conviction: true
                }
              ],

              sentences: [
                {
                  isActive: true,
                  startDate: "2011-02-19",
                }
              ]
            }
          ]
        },
        {
          eventId: 2254808,
          bookingId: 14608,
          startDateTime: "2013-02-19T10:00:00",

          courtEventCharges: [
            {
              chargeId: 22587,
              bookingId: 14608,

              resultCodes: [
                {
                  conviction: true
                }
              ],

              sentences: [
                {
                  isActive: false,
                  startDate: "2010-02-19",
                }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getEarliestSentenceAndConviction(input);
      result.should.have.property('earliestConviction');
      result.earliestConviction.should.have.property('startDateTime', '2010-02-19T10:03:00');
      result.should.have.property('earliestSentence');
      result.earliestSentence.should.have.property('startDate', '2011-02-19');
    });
  });

  describe('When court events list does not contain a conviction against the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 9041,
      },

      courtEvents: [
        {
          eventId: 2263830,
          bookingId: 14622,
          startDateTime: "2012-02-19T10:00:00",

          courtEventCharges: [
            {
              chargeId: 22611,
              bookingId: 14622,

              resultCodes: [
                {
                  conviction: true
                }
              ],

              sentences: [
                {
                  isActive: true,
                  startDate: "2011-02-19",
                }
              ]
            }
          ]
        }
      ],
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getEarliestSentenceAndConviction(input);
      result.should.have.property('earliestConviction');
      result.earliestConviction.should.not.have.property('startDateTime', '2010-02-19T10:03:00');
      result.should.have.property('earliestSentence');
      result.earliestSentence.should.not.have.property('startDate', '2011-02-19');
    });
  });

  describe('When court events list contains a single conviction against the main booking without a sentence', () => {
    let input = {

      mainBooking: {
        bookingId: 9138,
      },

      courtEvents: [
        {
          eventId: 841629,
          bookingId: 9138,
          startDateTime: "2008-08-27T10:00:00",

          courtEventCharges: [
            {
              chargeId: 17529,
              bookingId: 9138,

              resultCodes: [
                { conviction: true }
              ]
            }
          ]
        }
      ]
    };

    it('Should identify the conviction correctly', () => {
      let result = helpers.getEarliestSentenceAndConviction(input);
      result.should.have.property('earliestConviction');
      result.earliestConviction.should.not.have.property('startDateTime', '2010-02-19T10:03:00');
      result.should.have.property('earliestSentence');
      result.earliestSentence.should.not.have.property('startDate', '2011-02-19');
    });
  });


});
