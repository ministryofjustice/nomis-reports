const moment = require('moment');

const CDEModel = require('../../../app/models/CDE');
const builder = CDEModel.build(moment('2018-01-01'));


describe('cde/court', () => {
  describe('When the booking is linked to an alias', () => {
    let input = {
      nomsId: "X5815XX",
      offenderId: 1013128,
      firstName: "KOBIR",
      middleNames: "MATHEW PATRICE",
      surname: "ZAHIR",
      dateOfBirth: "1971-04-28",
      sexCode: "M",
      raceCode: "A1",
      aliases: [
        {
          nomsId: "X5815XX",
          offenderId: 1021466,
          firstName: "JJJ",
          surname: "VIS0001-MIG002",
          dateOfBirth: "1975-04-18",
          sexCode: "M",
        }
      ],
      bookings: [
        {
          bookingId: 8133,
          bookingNo: "BM9421",
          offenderId: 1021466,
          rootOffenderId: 1013128,
        }
      ],
    };

    let result = builder(input);

    it('Should select the offender\'s gender from the alias', () => {
      result.should.have.property('gender_f5', input.aliases[0].sexCode);
    });

    it('Should select the offender\'s surname from the alias', () => {
      result.should.have.property('surname_f7', input.aliases[0].surname);
    });

    it('Should select the offender\'s forename from the alias', () => {
      result.should.have.property('forename1_f8', input.aliases[0].firstName);
    });

    it('Should select the offender\'s middle names from the alias', () => {
      result.should.have.property('forename2_f9', input.aliases[0].middleNames);
    });

    it('Should select the offender\'s date of birth from the alias', () => {
      result.should.have.property('dob_f13');
      result.dob_f13.format().should.equal(moment(input.aliases[0].dateOfBirth).format());
    });

    it('Should select the offender\'s ethnicity from the alias', () => {
      result.should.have.property('ethnicity_f15', input.aliases[0].raceCode);
    });
  });

  describe('When the booking is linked to the root alias', () => {
    let input = {
      nomsId: "X5815XX",
      offenderId: 1013128,
      firstName: "KOBIR",
      middleNames: "MATHEW PATRICE",
      surname: "ZAHIR",
      dateOfBirth: "1971-04-28",
      sexCode: "M",
      raceCode: "A1",
      aliases: [
        {
          nomsId: "X5815XX",
          offenderId: 1021466,
          firstName: "JJJ",
          surname: "VIS0001-MIG002",
          dateOfBirth: "1975-04-18",
          sexCode: "M",
        }
      ],
      bookings: [
        {
          bookingId: 8133,
          bookingNo: "BM9421",
          offenderId: 1013128,
          rootOffenderId: 1013128,
        }
      ],
    };

    let result = builder(input);

    it('Should select the offender\'s gender from the alias', () => {
      result.should.have.property('gender_f5', input.sexCode);
    });

    it('Should select the offender\'s surname from the alias', () => {
      result.should.have.property('surname_f7', input.surname);
    });

    it('Should select the offender\'s forename from the alias', () => {
      result.should.have.property('forename1_f8', input.firstName);
    });

    it('Should select the offender\'s middle names from the alias', () => {
      result.should.have.property('forename2_f9', input.middleNames);
    });

    it('Should select the offender\'s date of birth from the alias', () => {
      result.should.have.property('dob_f13');
      result.dob_f13.format().should.equal(moment(input.dateOfBirth).format());
    });

    it('Should select the offender\'s ethnicity from the alias', () => {
      result.should.have.property('ethnicity_f15', input.raceCode);
    });
  });

  describe('When the booking is not present', () => {
    let input = {
      nomsId: "X5815XX",
      offenderId: 1013128,
      firstName: "KOBIR",
      middleNames: "MATHEW PATRICE",
      surname: "ZAHIR",
      dateOfBirth: "1971-04-28",
      sexCode: "M",
      raceCode: "A1",
      aliases: [
        {
          nomsId: "X5815XX",
          offenderId: 1021466,
          firstName: "JJJ",
          surname: "VIS0001-MIG002",
          dateOfBirth: "1975-04-18",
          sexCode: "M",
        }
      ],
    };

    let result = builder(input);

    it('Should select the offender\'s gender from the alias', () => {
      result.should.have.property('gender_f5', input.sexCode);
    });

    it('Should select the offender\'s surname from the alias', () => {
      result.should.have.property('surname_f7', input.surname);
    });

    it('Should select the offender\'s forename from the alias', () => {
      result.should.have.property('forename1_f8', input.firstName);
    });

    it('Should select the offender\'s middle names from the alias', () => {
      result.should.have.property('forename2_f9', input.middleNames);
    });

    it('Should select the offender\'s date of birth from the alias', () => {
      result.should.have.property('dob_f13');
      result.dob_f13.format().should.equal(moment(input.dateOfBirth).format());
    });

    it('Should select the offender\'s ethnicity from the alias', () => {
      result.should.have.property('ethnicity_f15', input.raceCode);
    });
  });
});
