const helpers = require('../../../app/models/helpers');

describe('cde/sentenceCalculations', () => {

  describe('When an offender has a series of sentence calculations for the active sentence', () => {
    let input = {

      sentenceCalculations: [
        { sentenceCalculationId: 6421, bookingId: 8133 },
        { sentenceCalculationId: 6350, bookingId: 8133 }
      ],

      mainBooking: { bookingId: 8133 },
    };

    it('should retrieve the first sentence calculation dates', () => {
      helpers.getOffenderSentenceCalculations(input)
        .should.have.property('sentenceCalculationId', 6421);
    });
  });

  describe('When an offender has a series of sentence calculations', () => {
    let input = {

      sentenceCalculations: [
        { sentenceCalculationId: 6421, bookingId: 8100 },
        { sentenceCalculationId: 6350, bookingId: 8133 }
      ],

      mainBooking: { bookingId: 8133 },
    };

    it('should retrieve the active sentence calculation dates', () => {
      helpers.getOffenderSentenceCalculations(input)
        .should.have.property('sentenceCalculationId', 6350);
    });
  });

  describe('When an offender has no sentence calculations associated with the active sentence', () => {
    let input = {

      sentenceCalculations: [
        { sentenceCalculationId: 6421, bookingId: 8100 },
        { sentenceCalculationId: 6350, bookingId: 8100 }
      ],

      mainBooking: { bookingId: 8133 },
    };

    it('should not retrieve any sentence calculation dates', () => {
      helpers.getOffenderSentenceCalculations(input)
        .should.not.have.property('sentenceCalculationId');
    });
  });

});
