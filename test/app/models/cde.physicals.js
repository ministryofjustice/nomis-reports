let should = require('chai').should();

const moment = require('moment');

const helpers = require('../../../app/models/helpers');

describe('cde/physicals', () => {
  describe('When an offender has physical details associated with the main booking', () => {
    let input = {
      mainBooking: {
        bookingId: 7762,
      },

      physicals: [
        {
          bookingId: 7762,
          physicalAttributes: [
            {
              attributeSeq: 1,
              heightFeet: 5,
              heightInches: 11,
              heightCm: 180,
              weightLbs: 163,
              weightKg: 74
            }
          ],
          profileDetails: [
            {
              profileSeq: 1,
              profileType: "TAT",
              listSeq: 8,
              caseloadType: "INST"
            },
            {
              profileSeq: 1,
              profileType: "TRAVEL",
              listSeq: 20,
              caseloadType: "INST"
            },
            {
              profileSeq: 1,
              profileType: "YOUTH",
              profileCode: "N",
              listSeq: 2,
              comments: "The quick ",
              caseloadType: "INST"
            }
          ]
        }
      ],
    };

    it('Should identify the correct physicals', () => {
      let result = helpers.getPhysicals(input);
      result.should.have.property('profileDetails');
      result.profileDetails.should.have.property('YOUTH', 'N');
    });
  });
});
