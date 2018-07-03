const helpers = require('../../../app/models/helpers');

describe('cde/securityCategory', () => {

  describe('When an offenders only assessment is for security category', () => {
    let input = {
      mainBooking: { bookingId: 12821 },

      assessments: [
        {
          assessmentId: 1,
          bookingId: 12821,
          evaluationResultCode: 'APP',
          assessStatus: 'A',
          assessmentType: {
            assessmentClass: 'TYPE',
            assessmentCode: 'CATEGORY',
            determineSupLevelFlag: true,
          }
        },
      ],
    };

    it('Should identify the correct category', () => {
      let result = helpers.getOffenderSecurityCategory(input);

      result.should.have.property('assessmentId', 1);
    });
  });

  describe('When an offender has two assessments but only the second is for security category', () => {
    let input = {
      mainBooking: { bookingId: 12821 },

      assessments: [
        {
          assessmentId: 1,
          bookingId: 12821,
          evaluationResultCode: 'APP',
          assessStatus: 'A',
          assessmentType: {
            assessmentClass: 'TYPE',
            assessmentCode: 'CSRDO',
            determineSupLevelFlag: false,
          }
        },
        {
          assessmentId: 2,
          bookingId: 12821,
          evaluationResultCode: 'APP',
          assessStatus: 'A',
          assessmentType: {
            assessmentClass: 'TYPE',
            assessmentCode: 'CATEGORY',
            determineSupLevelFlag: true,
          }
        },
      ],
    };

    it('Should identify the correct category', () => {
      let result = helpers.getOffenderSecurityCategory(input);

      result.should.have.property('assessmentId', 2);
    });
  });
});
