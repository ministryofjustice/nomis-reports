const moment = require('moment');

const CDEModel = require('../../../app/models/CDE');
const builder = CDEModel.build(moment('2018-01-01'));


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

    SELECT vce.agy_loc_id court_code_f150,
         vce.description court_name_f151
    FROM (SELECT oc.offence_code,
                 oc.result_code_1,
                 ce.event_date,
                 ce.event_id,
                 ce.result_code,
                 ce.outcome_reason_code,
                 ce.agy_loc_id,
                 al.description,
                 MAX(ce.event_date) OVER (PARTITION BY oc.offender_book_id) max_event_date,
                 MAX(ce.event_id) OVER(PARTITION BY oc.offender_book_id, ce.event_date) max_event_id
            FROM offender_charges oc,
                 court_event_charges cec,
                 court_events ce,
                 agency_locations al,
                 offender_sentence_charges osc
           WHERE cec.offender_charge_id = oc.offender_charge_id
             AND ce.event_id = cec.event_id
             AND al.agy_loc_id = ce.agy_loc_id
             AND osc.offender_charge_id = oc.offender_charge_id
             AND oc.offender_book_id = :p_offender_book_id) vce,
         offence_result_codes orc
   WHERE orc.result_code = vce.outcome_reason_code
     AND vce.max_event_date = vce.event_date
     AND vce.max_event_id = vce.event_id
     AND rownum = 1

    */

    it('Should select the correct court code', () => {
      builder(input).should.have.property('court');
      builder(input).court.should.have.property('type_f149', undefined);
      builder(input).court.should.have.property('code_f150', undefined);
      builder(input).court.should.have.property('name_f151', ''); // not filled as is reference data

    });
  });
});