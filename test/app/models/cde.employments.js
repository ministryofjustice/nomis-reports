const helpers = require('../../../app/models/helpers');


describe('cde/employments', () => {

  // helpers.getEmployment

  describe('When an offender has one employment with no termination date', () => {
    let input = {
      mainBooking: {
        bookingId: 315287,
      },

      employments: [
        { bookingId: 315287, employmentDate: '2003-01-01', occupationsCode: '606' }
      ],
    };

    it('Should identify the occupation', () => {
      helpers.getEmployment(input).should.have.property('occupationsCode', '606');
    });
  });

  describe('When an offender has one employment with a termination date after the main booking start date', () => {
    let input = {
      mainBooking: {
        bookingId: 315287,
        startDate: '2004-01-01',
      },

      employments: [
        { bookingId: 315287, employmentDate: '2003-01-01', terminationDate: '2005-01-01', occupationsCode: '606' }
      ],
    };

    it('Should identify the occupation', () => {
      helpers.getEmployment(input).should.have.property('occupationsCode', '606');
    });
  });

  describe('When an offender has one employment with a termination date before the main booking start date', () => {
    let input = {
      mainBooking: {
        bookingId: 315287,
        startDate: '2005-01-01',
      },

      employments: [
        { bookingId: 315287, employmentDate: '2003-01-01', terminationDate: '2004-01-01', occupationsCode: '606' }
      ],
    };

    it('Should not identify the occupation', () => {
      helpers.getEmployment(input).should.not.have.property('occupationsCode');
    });
  });

  // helpers.getOffenderEmployments

  describe('When an offender has one employment with no termination date', () => {
    let input = {
      mainBooking: {
        bookingId: 315287,
      },

      employments: [
        { bookingId: 315287, employmentDate: '2003-01-01', occupationsCode: '606' }
      ],
    };

    it('Should identify the occupation', () => {
      let result = helpers.getOffenderEmployments(input);
      result.length.should.equal(1);
      result[0].should.have.property('occupationsCode', '606');
    });
  });

  describe('When an offender has one employment with a termination date', () => {
    let input = {
      mainBooking: {
        bookingId: 315287,
      },

      employments: [
        { bookingId: 315287, employmentDate: '2003-01-01', terminationDate: '2009-01-01', occupationsCode: '606' }
      ],
    };

    it('Should not identify the occupation', () => {
      helpers.getOffenderEmployments(input).length.should.equal(0);
    });
  });

  // helpers.receptionEmployment
  // helpers.dischargeEmployment

  describe('When an offender has one identified employment', () => {
    let input = {
      mainBooking: {
        bookingId: 1,
      },

      offenderEmployments: [
        { bookingId: 1, employmentDate: '2009-01-01', occupationsCode: '1' }
      ],
    };

    it('Should pick the only one as the reception employment', () => {
      helpers.receptionEmployment(input).should.have.property('occupationsCode', '1');
    });

    it('Should pick the only one as the discharge employment', () => {
      helpers.dischargeEmployment(input).should.have.property('occupationsCode', '1');
    });
  });

  describe('When an offender has several identified employments', () => {
    let input = {
      mainBooking: {
        bookingId: 1,
      },

      offenderEmployments: [
        { bookingId: 1, employmentDate: '2009-01-01', occupationsCode: '1' },
        { bookingId: 1, employmentDate: '2003-01-01', occupationsCode: '2' }
      ],
    };

    it('Should pick the last as the reception employment', () => {
      helpers.receptionEmployment(input).should.have.property('occupationsCode', '2');
    });

    it('Should pick the first as the discharge employment', () => {
      helpers.dischargeEmployment(input).should.have.property('occupationsCode', '1');
    });
  });

});
