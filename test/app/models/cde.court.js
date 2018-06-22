let should = require('chai').should();

const moment = require('moment');

const helpers = require('../../../app/models/helpers');

describe('cde/court', () => {
  describe('When court order is most recent first', () => {
    let input = {
      bookings: [
        {
          bookingId: 8133,
        }
      ],

      mainBooking: {
        bookingId: 8133,
      },

      charges: [
        {
          chargeId: 18791,
          bookingId: 8100,
          offenceCode: "CD71015",
          statuteCode: "CD71",
          offenceSeverityRanking: 20,
          offenceIndicatorCodes: [ "ERS", "70", "S15/CJIB" ],
          offenceDate: "2008-12-22",
          chargeStatus: "A",
          resultCodes: [ "1002" ],
          case: {
            caseId: 10547,
            caseType: "A",
            caseStatus: "I",
            beginDate: "2009-01-12",
            agencyLocationId: "CRNRCC",
            lidsCaseNumber: 1,
            nomLegalCaseRef: 17,
            nomLegalCaseRefTransTo: 0,
            caseSequence: 1
          },
          mostSeriousCharge: true,
          lidsOffenceNumber: 1
        },
        {
          chargeId: 18709,
          bookingId: 8133,
          offenceCode: "TH68058",
          statuteCode: "TH68",
          offenceSeverityRanking: 86,
          offenceIndicatorCodes: [ "52" ],
          pleaCode: "G",
          chargeStatus: "A",
          resultCodes: [ "1002" ],
          case: {
            caseId: 10469,
            caseType: "A",
            caseStatus: "A",
            beginDate: "2009-01-06",
            agencyLocationId: "ABDRCT",
            lidsCaseNumber: 1,
            caseSequence: 1
          },
          mostSeriousCharge: true,
          lidsOffenceNumber: 1
        },
        {
          chargeId: 18794,
          bookingId: 8133,
          offenceCode: "CD71015",
          statuteCode: "CD71",
          offenceSeverityRanking: 20,
          offenceIndicatorCodes: [ "ERS", "70", "S15/CJIB" ],
          offenceDate: "2008-12-11",
          chargeStatus: "A",
          resultCodes: [ "1002" ],
          case: {
            caseId: 10550,
            caseType: "A",
            caseStatus: "A",
            beginDate: "2008-12-18",
            agencyLocationId: "CRNRCC",
            lidsCaseNumber: 1,
            nomLegalCaseRef: 17,
            nomLegalCaseRefTransTo: 0,
            caseSequence: 2
          },
          mostSeriousCharge: false,
          lidsOffenceNumber: 1
        }
      ],

      courtEvents: [
        {
          eventId: 1069497,
          caseId: 10550,
          bookingId: 8133,
          startDateTime: "2008-11-25T10:03:00",
          courtEventType: "CA",
          eventStatus: "SCH",
          agencyLocationId: "CRNRCC",
          courtEventCharges: [
            { chargeId: 18794 },
          ]
        },
        {
          eventId: 1069492,
          caseId: 10547,
          bookingId: 8100,
          startDateTime: "2008-11-25T10:03:00",
          courtEventType: "CA",
          eventStatus: "SCH",
          agencyLocationId: "CRNRCC",
          courtEventCharges: [
            { chargeId: 18791 },
          ]
        },
        {
          eventId: 1069496,
          caseId: 10550,
          bookingId: 8133,
          startDateTime: "2008-11-25T10:01:00",
          courtEventType: "CA",
          eventStatus: "SCH",
          agencyLocationId: "CRNRCC",
          courtEventCharges: [
            { chargeId: 18794 },
          ]
        },
        {
          eventId: 1069491,
          caseId: 10547,
          bookingId: 8100,
          startDateTime: "2008-11-25T10:01:00",
          courtEventType: "CA",
          eventStatus: "SCH",
          agencyLocationId: "CRNRCC",
          courtEventCharges: [
            { chargeId: 18791  },
          ]
        },
        {
          eventId: 1061704,
          caseId: 10469,
          bookingId: 8133,
          startDateTime: "2008-11-25T10:00:00",
          courtEventType: "SENT",
          eventStatus: "COMP",
          agencyLocationId: "ABDRCT",
          courtEventCharges: [
            { chargeId: 18709  }
          ]
        }
      ],
    };

    /*
    SELECT
          ce.outcome_reason_code court_type_f149,
          ce.event_id,
          ce.event_date,
    FROM
          court_events ce
    WHERE ce.direction_code = 'OUT'
      AND ce.caseId IS NOT NULL
    ORDER BY
          ce.event_date DESC,
          ce.event_id DESC
    */

    it('Should identify the correct court outcome', () => {
      helpers.getCourtOutcome(input).should.not.have.property('chargeId', 18709);
    });

    /*
    SELECT oc.offence_code,
           oc.result_code_1,
           ce.event_date,
           ce.event_id,
           ce.result_code,
           ce.outcome_reason_code,
           ce.agy_loc_id court_code_f150,
           '' as court_name_f151
      FROM offender_charges oc,
           court_event_charges cec,
           court_events ce,
           offender_sentence_charges osc
     WHERE cec.offender_charge_id = oc.offender_charge_id
       AND ce.event_id = cec.event_id
       AND osc.offender_charge_id = oc.offender_charge_id
     ORDER BY
           ce.event_date DESC,
           ce.event_id DESC
    */

    it('Should identify the most recent conviction correctly', () => {
      helpers.getMostRecentConviction(input).should.have.property('chargeId', 18791);
    });
  });
});
