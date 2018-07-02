const helpers = require('../../../app/models/helpers');

describe('cde/sentenceLength', () => {
  describe('When the offender has a single active sentence associated with the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 8133,
      },

      sentences: [
        { bookingId: 8133, isActive: true, startDate: "2008-11-25" },
      ],

    };

    it('should retrieve the sentence', () => {
      helpers.getActiveOffenderSentence(input).should.have.property('startDate', '2008-11-25');
    });
  });

  describe('When the offender has no active sentence associated with the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 8133,
      },

      sentences: [
        { bookingId: 8133, isActive: false, startDate: "2008-11-25" },
      ],

    };

    it('should retrieve the sentence', () => {
      helpers.getActiveOffenderSentence(input).should.not.have.property('startDate');
    });
  });

  describe('When the offender has multiple active sentences associated with the main booking', () => {
    let input = {

      mainBooking: {
        bookingId: 8133,
      },

      sentences: [
        { bookingId: 8133, isActive: true, startDate: "2008-11-25" },
        { bookingId: 8133, isActive: true, startDate: "2009-11-25" },
      ],

    };

    it('should retrieve the first sentence', () => {
      helpers.getActiveOffenderSentence(input).should.have.property('startDate', '2008-11-25');
    });
  });

});
