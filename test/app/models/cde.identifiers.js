const helpers = require('../../../app/models/helpers');

describe('cde/identifiers', () => {
  describe('When an offender has PNC numbers on the root offender and other aliases', () => {
    let input = {
      nomsId: "A5465AA",
      offenderId: 1014520,

      aliases: [
        {
          nomsId: "A5465AA",
          offenderId: 1014521,

          identifiers: [
            {
              identifierType: "PNC",
              identifier: "00/1234567B",
              sequenceNumber: 1,
              createdDateTime: "2008-10-06T14:09:07.119115"
            }
          ]
        }
      ],

      identifiers: [
        {
          identifierType: "PNC",
          identifier: "00/1234567A",
          sequenceNumber: 1,
          createdDateTime: "2008-10-06T14:10:16.430658"
        }
      ],
    };

    it('Should map all identifiers', () => {
      let result = helpers.mapOffenderIdentifiers(input);
      result.should.have.property('PNC');
      result.PNC.should.eql([ "00/1234567B", "00/1234567A" ]);
    });
  });
});
