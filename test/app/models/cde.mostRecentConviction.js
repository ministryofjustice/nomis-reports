const helpers = require('../../../app/models/helpers');

describe('cde/mostRecentConviction', () => {
  describe('When court events list contains a conviction', () => {
    let input = {
      bookings: [
        {
          bookingId: 9740,
        }
      ],

      mainBooking: {
        bookingId: 9740,
      },

      charges: [
      ],

      courtEvents: [
        {
          eventId: 993558,
          caseId: 9921,
          bookingId: 9740,
          startDateTime: "2008-10-23T10:00:00",
          endDateTime: "2008-10-23T00:00:00",
          courtEventType: "SENT",
          eventStatus: "EXP",
          agencyLocationId: "ABRYMC",
          outcomeReasonCode: "1015",
          nextEventRequest: false,
          orderRequested: false,
          directionCode: "OUT",
          hold: false,
          courtEventCharges: [
            {
              chargeId: 18101,
              bookingId: 9740,
              offenderId: 1014846,
              offenceCode: "RT88946",
              statuteCode: "RT88",
              offenceSeverityRanking: 93,
              offenceIndicatorCodes: [
                "99"
              ],
              propertyValue: 1234.56,
              chargeStatus: "I",
              resultCodes: [
                "1015"
              ],
              case: {
                caseId: 9921,
                caseType: "A",
                caseStatus: "A",
                beginDate: "2008-12-16",
                agencyLocationId: "ABRYMC",
                lidsCaseNumber: 2,
                caseSequence: 2
              },
              mostSeriousCharge: false,
              lidsOffenceNumber: 1
            }
          ]
        },
        {
        eventId: 993546,
        caseId: 9914,
        bookingId: 9740,
        startDateTime: "2008-10-23T10:00:00",
        endDateTime: "2008-10-23T00:00:00",
        courtEventType: "SENT",
        eventStatus: "EXP",
        agencyLocationId: "EASBMC",
        outcomeReasonCode: "1002",
        nextEventRequest: false,
        orderRequested: false,
        directionCode: "OUT",
        hold: false,
        courtEventCharges: [
        {
        chargeId: 18095,
        bookingId: 9740,
        offenderId: 1014846,
        offenceCode: "TH68058",
        statuteCode: "TH68",
        offenceSeverityRanking: 86,
        offenceIndicatorCodes: [
        "52"
        ],
        pleaCode: "G",
        chargeStatus: "A",
        resultCodes: [
        "1002"
        ],
        case: {
        caseId: 9914,
        caseType: "A",
        caseStatus: "A",
        beginDate: "2008-10-28",
        agencyLocationId: "EASBMC",
        lidsCaseNumber: 1,
        caseSequence: 1
        },
        mostSeriousCharge: true,
        lidsOffenceNumber: 4,
        sentences: [
        {
        offenderId: 1014846,
        bookingId: 9740,
        sentenceSequenceNumber: 1,
        isActive: true,
        sentenceCategory: "2003",
        sentenceCalcType: "ADIMP",
        aggregateAdjustDays: 0,
        sentenceLevel: "IND",
        extendedDays: 0,
        startDate: "2008-10-23",
        endDate: "2011-01-22",
        crdCalculatedDate: "2009-12-07",
        sedCalculatedDate: "2011-01-22",
        hdcedCalculatedDate: "2009-07-26",
        createdAt: "2008-10-23T13:09:41.277073",
        hdcExclusion: false
        }
        ]
        }
        ]
        },
        {
        eventId: 993543,
        caseId: 9914,
        bookingId: 9740,
        startDateTime: "2008-10-15T10:00:00",
        endDateTime: "2008-10-15T00:00:00",
        courtEventType: "SENT",
        eventStatus: "SCH",
        agencyLocationId: "EASBMC",
        outcomeReasonCode: "3012",
        nextEventRequest: false,
        orderRequested: false,
        directionCode: "OUT",
        hold: false,
        courtEventCharges: [
        {
        chargeId: 18093,
        bookingId: 9740,
        offenderId: 1014846,
        offenceCode: "GA05016",
        statuteCode: "GA05",
        offenceSeverityRanking: 93,
        offenceIndicatorCodes: [
        "99"
        ],
        pleaCode: "G",
        propertyValue: 1500,
        chargeStatus: "I",
        resultCodes: [
        "3012"
        ],
        case: {
        caseId: 9914,
        caseType: "A",
        caseStatus: "A",
        beginDate: "2008-10-28",
        agencyLocationId: "EASBMC",
        lidsCaseNumber: 1,
        caseSequence: 1
        },
        mostSeriousCharge: false,
        lidsOffenceNumber: 3
        }
        ]
        },
      ]
    };

    /*
    SELECT ce.agy_loc_id court_code_f150,
           '' as court_name_f151
      FROM offender_charges oc,
           court_event_charges cec,
           court_events ce,
           offender_sentence_charges osc
     WHERE ce.event_id = cec.event_id
       AND cec.offender_charge_id = oc.offender_charge_id
       AND osc.offender_charge_id = oc.offender_charge_id
     ORDER BY
           ce.event_date DESC,
           ce.event_id DESC
    */

    it('Should identify the conviction correctly', () => {
      let result = helpers.getMostRecentConviction(input);
      result.should.have.property('eventId', 993546);
      result.should.have.property('agencyLocationId', 'EASBMC');
    });
  });
});
