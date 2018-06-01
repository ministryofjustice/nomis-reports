const moment = require('moment');

const CDEModel = require('../../../app/models/CDE');
const builder = CDEModel.build(moment('2018-01-01'));

describe('cde/court', () => {
  describe('When the booking is linked to an alias', () => {
    let input = {
      bookings: [
        {
          bookingId: 8133,
        }
      ],
      mainBooking: {
        bookingId: 8133,
      },
      sentenceCalculations: [
        {
          sentenceCalculationId: 6421,
          bookingId: 8100,
          hdcedOverridedDate: "2009-07-15T00:00:00",
          crdOverridedDate: "2009-11-26T00:00:00",
          ledOverridedDate: "2010-11-26T00:00:00",
          sedOverridedDate: "2010-11-26T00:00:00",
          effectiveSentenceEndDate: "2010-11-26T00:00:00",
        },
        {
          sentenceCalculationId: 6350,
          bookingId: 8133,
          hdcedCalculatedDate: "2009-07-13T00:00:00",
          crdCalculatedDate: "2009-11-24T00:00:00",
          ledCalculatedDate: "2010-05-26T00:00:00",
          sedCalculatedDate: "2010-11-24T00:00:00",
          effectiveSentenceEndDate: "2010-11-24T00:00:00",
          effectiveSentenceLength: "02/00/00",
          judiciallyImposedSentenceLength: "02/00/00"
        }
      ],
      sentences: [
        {
          bookingId: 8133,
          sentenceSequenceNumber: 1,
          isActive: true,
          startDate: "2008-11-25",
          endDate: "2010-11-24",
          createdAt: "2008-11-25T15:33:22.039129",
        },
        {
          bookingId: 8133,
          sentenceSequenceNumber: 2,
          isActive: true,
          startDate: "2008-11-25",
          endDate: "2010-11-24",
          createdAt: "2008-11-28T11:02:39.531422",
        },
        {
          bookingId: 8133,
          sentenceSequenceNumber: 3,
          isActive: true,
          startDate: "2009-11-20",
          endDate: "2010-03-25",
          createdAt: "2008-11-28T11:02:39.754416",
        },
        {
          bookingId: 8100,
          sentenceSequenceNumber: 1,
          isActive: false,
          startDate: "2008-11-25",
          endDate: "2010-11-24",
          createdAt: "2008-11-28T11:02:10.926697",
        },
        {
          bookingId: 8100,
          sentenceSequenceNumber: 2,
          isActive: false,
          startDate: "2009-11-20",
          endDate: "2010-03-25",
          createdAt: "2008-11-28T11:02:13.015361",
        },
      ],
    };

    let result = builder(input);

    it('Should select the offender\'s date of birth from the alias', () => {
      /*
      sentence: {
        years_f28: "02",
        months_f29: "00",
        days_f30: "00"
      },
      */

      result.should.have.property('sentence_length_f64', 730);
    });
  });

});
