const moment = require('moment');
const helpers = require('./helpers');

const model = helpers.pipe([
  // bookings
  ['mainBooking', helpers.getMainBooking],                                      // bookings
  ['previousBookingNos', helpers.getPreviousBookings],                          // bookings
//['activeBookings', helpers.getActiveBookings],                                // bookings
  ['custodyStatus', helpers.getCustodyStatus],                                  // mainBooking
  // aliases
  ['mainAlias', helpers.getMainAlias],                                          // aliases
  // identifiers
  ['offenderIdentifiers', helpers.mapOffenderIdentifiers],                      // identifiers
  // assessments
  ['offenderSecurityCategory', helpers.getOffenderSecurityCategory],            // assessments
//['offenderSecurityCategory', helpers.getOffenderSecurityCategory2],           // assessments
//['csraLevel', helpers.getCSRALevel],                                          // assessments
  // sentences
//['firstSentenceAndCounts', helpers.getFirstSentenceAndCounts],                // sentences
  ['offenderSentence', helpers.getActiveOffenderSentence],                      // sentences
  ['offenderLicenses', helpers.getOffenderLicenses],                            // sentences
  // sentenceCalculations
  ['offenderSentenceCalculations', helpers.getOffenderSentenceCalculations],    // sentenceCalculations
  ['offenderSentenceCalculationDates', helpers.getOffenderSentenceCalculationDates],  // offenderSentenceCalculations
  ['effectiveSentenceLength', helpers.getEffectiveSentenceLength],              // offenderSentenceCalculations
  ['offenderSentenceLength', helpers.getOffenderSentenceLength],                // offenderSentenceCalculations, offenderSentence
  ['earliestReleaseDate', helpers.getEarliestReleaseDate],                      // offenderSentenceCalculationDates
//['earliestReleaseDate', helpers.getEarliestReleaseDate2],                      // offenderSentenceCalculationDates
  // movements
  ['activeTransfers', helpers.getActiveTransfers],                              // movements
  ['firstSequentialMovement', helpers.getFirstSequentialMovement],                // movements
  ['lastSequentialMovement', helpers.getLastSequentialMovement],                // movements
  ['lastSequentialMovementIfOut', helpers.getLastSequentialMovementIfOut],      // movements
  ['lastSequentialTransfer', helpers.getLastSequentialTransfer],                // movements
  ['earliestOutMovementDate', helpers.getEarliestOutMovementDate],              // movements
  // employments
  ['offenderEmployments', helpers.getOffenderEmployments],                      // employments
  ['employment', helpers.getEmployment],                                        // employments
  ['dischargeEmployment', helpers.dischargeEmployment],                         // offenderEmployments
  ['receptionEmployment', helpers.receptionEmployment],                         // offenderEmployments
  // charges
  ['offenderCharges', helpers.getOffenderCharges],                              // charges
  ['isSexOffender', helpers.isSexOffender],                                     // charges
//['offenceGroups', helpers.getOffenceGroups],                                  // charges
//['mainOffence', helpers.getOffenderMainOffence],                              // offenderCharges
  ['highestRankedOffence', helpers.getHighestRankedOffence],                    // offenderCharges
  ['otherOffences', helpers.getOtherOffences],                                  // offenderCharges
//['firstOffence', helpers.getFirstOffenderOffence],                            // offenderCharges
  //contactPersons
  ['offenderContactPersons', helpers.getContactPersons],                        // contactPersons
  ['nextOfKin', helpers.getNextOfKin],                                          // offenderContactPersons
  ['offenderManager', helpers.getOffenderManager],                              // offenderContactPersons
  //addresses
//['offenderAddresses', helpers.getOffenderAddresses],                          // addresses
  ['offenderHomeAddress', helpers.getOffenderHomeAddress],                      // addresses
  ['offenderReceptionAddress', helpers.getOffenderReceptionAddress],            // addresses
  ['offenderDischargeAddress', helpers.getOffenderDischargeAddress],            // addresses
//['offenderDischargeAddress', helpers.getOffenderDischargeAddress2],           // addresses
  // alerts
  ['activeAlerts', helpers.getActiveAlerts],                                    // alerts
  ['notForRelease', helpers.getNotForReleaseAlerts],                            // alerts
  ['MAPPA', helpers.getMAPPAAlerts],                                            // alerts
  ['checkHoldAlerts', helpers.getCheckHoldAlerts],                              // activeAlerts
  // physicals
  ['physicals', helpers.getPhysicals],                                          // physicals
  // ieps
  ['IEPLevel', helpers.getIEPLevel],                                            // ieps
  // imprisonmentStatuses
  ['offenderImprisonmentStatus', helpers.getImprisonmentStatus],                // imprisonmentStatuses
  // releaseDetails
  ['releaseDetails', helpers.getReleaseDetails],                                // releaseDetails
  // courtEvents
  ['mostRecentConviction', helpers.getMostRecentConviction],                    // courtEvents
  ['earliestSentenceAndConviction', helpers.getEarliestSentenceAndConviction],  // courtEvents
  ['courtOutcome', helpers.getCourtOutcome],                                    // courtEvents
  // healthProblems
  ['maternityStatus', helpers.getMaternityStatus],                              // healthProblems
  // programmeProfiles, individualSchedules
  ['offenderEmployed', helpers.isEmployed],                                     // programmeProfiles, individualSchedules
  // diaryDetails
  ['futureDiaryDetails', helpers.getFutureDiaryDetails]                         // diaryDetails
]);

const buildModel = module.exports.buildModel = sysdate => data => {
  return model.apply(Object.assign({ sysdate }, data));
};

module.exports.build = sysdate => data => {
  let o = buildModel(sysdate)(data);

  return {
    sysdate_f1: o.sysdate,
    establishment_f2: "",
    estab_code_f3: (o.mainBooking.agencyLocation || {}).agencyLocationId,
    nomis_id_f4: o.nomsId,
    gender_f5: (o.mainAlias.gender || {}).description,
    prison_no_f6: o.mainBooking.bookingNo,
    surname_f7: o.mainAlias.surname,
    forename1_f8: o.mainAlias.firstName,
    forename2_f9: o.mainAlias.middleNames,
    cro_f10: o.offenderIdentifiers.CRO,
    adult_yp_f11: (o.physicals.profileDetails.YOUTH || {}).description,
    age_f12: helpers.getAge(o.mainAlias, o.sysdate),
    dob_f13: helpers.optionalDate(o.mainAlias.dateOfBirth),
    nationality_f14: (o.physicals.profileDetails.NAT || {}).description,
    ethnicity_f15: (o.mainAlias.ethnicity || {}).description,
    religion_f16: (o.physicals.profileDetails.RELF || {}).description,
    marital_f17: (o.physicals.profileDetails.MARITAL || {}).description,
    maternity_status_f18: (o.maternityStatus.problemCode || {}).description,
    location_f19: (o.mainBooking.livingUnit || {}).agencyLocationId ? o.mainBooking.livingUnit.description
          .replace(o.mainBooking.livingUnit.agencyLocationId + '-', '') : (o.mainBooking.livingUnit || {}).description,
    incentive_band_f20: (o.IEPLevel.iepLevel || {}).description,
    occupation_v21: (o.employment.occupationsCode || {}).description,
    transfer_reason_f22: o.lastSequentialTransfer.movementReasonDescription,
    first_reception_date_f23: helpers.optionalDate(o.mainBooking.startDate),
    custody_status_f24: o.custodyStatus,
    inmate_status_f25: (o.offenderImprisonmentStatus.imprisonmentStatus || {}).description,

    sec_cat: {
      level_f26: (o.offenderSecurityCategory.reviewSupLevelType || {}).description,
      next_review_f27: helpers.optionalDate(o.offenderSecurityCategory.nextReviewDate),
    },

    sentence: {
      years_f28: o.effectiveSentenceLength.years,
      months_f29: o.effectiveSentenceLength.months,
      days_f30: o.effectiveSentenceLength.days,
    },

    previous_prison_no_f31: o.previousBookingNos,
    earliest_release_date_f32: o.earliestReleaseDate,

    check_hold: {
      governor_f33: o.checkHoldAlerts.T_TG,
      // 34	Check Hold General (to be left blank)
      // 35	Check Hold Discipline (to be left blank)
      allocation_36: o.checkHoldAlerts.T_TAH,
      security_37: o.checkHoldAlerts.T_TSE,
      medical_38: o.checkHoldAlerts.T_TM,
      parole_39: o.checkHoldAlerts.T_TPR,
    },

    date_of_first_conviction_40: helpers.optionalDate(o.earliestSentenceAndConviction.earliestConviction.startDateTime),
    date_first_sentenced_f41: helpers.optionalDate(o.earliestSentenceAndConviction.earliestSentence.startDate),
    f2052_status_42: o.checkHoldAlerts.H_HA,
    highest_ranked_offence_f43: o.highestRankedOffence.offenceCode,
    // 44	Status Rank (to be left blank)
    pending_transfers_f45: ((o.activeTransfers[0] || {}).toAgencyLocation || {}).description,
    received_from_f46: ((o.activeTransfers[0] || {}).fromAgencyLocation || {}).description,
    vulnerable_prisoner_alert_f47: o.checkHoldAlerts.VUL,
    pnc_f48: o.offenderIdentifiers.PNC,

    emplmnt_status: {
      discharge_f49: (o.dischargeEmployment.employmentPostCode || {}).description,
      reception_f50: (o.receptionEmployment.employmentPostCode || {}).description,
    },

    schedule_1_sex_offender_f51: (o.MAPPA.alertCode || {}).description,
    sex_offender_f52: (o.isSexOffender ? 'Y' : 'N'),
    supervising_service_f53: helpers.formatSupervisingService(o.offenderManager),
    height_metres_f54: helpers.optionalHeight(o.physicals.physicalAttributes.heightCm),
    complexion_f55: (o.physicals.profileDetails.COMPL || {}).description,
    hair_f56: (o.physicals.profileDetails.HAIR || {}).description,
    left_eye_f57: (o.physicals.profileDetails.L_EYE_C || {}).description,
    right_eye_f58: (o.physicals.profileDetails.R_EYE_C || {}).description,
    build_f59: (o.physicals.profileDetails.BUILD || {}).description,
    face_f60: (o.physicals.profileDetails.FACE || {}).description,
    facial_hair_f61: (o.physicals.profileDetails.FACIAL_HAIR || {}).description,

    marks: {
      head_f62: o.physicals.identifyingMarks.HEAD.map(helpers.formatIdentifyingMark),
      body_f63: o.physicals.identifyingMarks.BODY.map(helpers.formatIdentifyingMark),
    },

    sentence_length_f64: o.offenderSentenceLength,

    release: {
      date_f65: helpers.optionalDate((o.releaseDetails || {}).releaseDate),
      name_f66: (o.releaseDetails || {}).movementReasonDescription,
    },

    sed_f67: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).sed),
    hdced_f68: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).hdced),
    hdcad_f69: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).hdcad),
    ped_f70: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).ped),
    crd_f71: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).crd),
    npd_f72: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).npd),
    led_f73: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).led),
    date_sec_cat_changed_f74: helpers.optionalDate(o.offenderSecurityCategory.evaluationDate),
    rule_45_yoi_rule_46_f75: o.checkHoldAlerts.V_45_46,

    f2052sh: {
      alert_f76: o.checkHoldAlerts.SH_STS,
      start_f77: helpers.optionalDate(o.checkHoldAlerts.SH_Date),
    },

    discharge: helpers.modelAddress({
        nfa_f78: helpers.getDischargeNFA(o.offenderDischargeAddress)
      }, 79, o.offenderDischargeAddress, 'HOME'),

    reception: helpers.modelAddress({
        nfa_f86: helpers.getNFA(o.offenderReceptionAddress)
      }, 87, o.offenderReceptionAddress, 'HOME'),

    home: helpers.modelAddress({
      }, 94, o.offenderHomeAddress, 'HOME'),

    nok: helpers.modelAddress({
        name_f101: helpers.formatContactPersonName(o.nextOfKin),
        nfa_f102: helpers.getNFA(o.nextOfKin.primaryAddress || {}),
      }, 103, o.nextOfKin ? o.nextOfKin.primaryAddress : undefined, 'HOME'),

    prob: helpers.modelAddress({
        name_f110: helpers.formatContactPersonName(o.offenderManager)
      }, 111, o.offenderManager ? o.offenderManager.primaryAddress : undefined, 'BUS'),

    f118: "",  // 118	Remark Type Allocation
    f119: "",  // 119	Remarks Allocation
    f120: "",  // 120	Remark Type Security
    f121: "",  // 121	Remarks Security
    f122: "",  // 122	Remark Type Medical
    f123: "",  // 123	Remarks Medical
    f124: "",  // 124	Remark Type Parole
    f125: "",  // 125	Remarks Parole
    f126: "",  // 126	Remark Type Discipline
    f127: "",  // 127	Remarks Discipline
    f128: "",  // 128	Remark Type General
    f129: "",  // 129	Remarks General
    f130: "",  // 130	Remark Type Reception
    f131: "",  // 131	Remarks Reception
    f132: "",  // 132	Remark Type Labour
    f133: "",  // 133	Remarks Labour

    sending_estab_f134: (o.lastSequentialTransfer.fromAgencyLocation || {}).description,
    reason_f135: o.lastSequentialTransfer.movementReasonDescription,

    movement: o.lastSequentialMovement && {
      date_f136: helpers.optionalDate(o.lastSequentialMovement.movementDateTime),
      hour_f137: moment(o.lastSequentialMovement.movementDateTime).format('HH'),
      min_f138: moment(o.lastSequentialMovement.movementDateTime).format('mm'),
      sec_f139: moment(o.lastSequentialMovement.movementDateTime).format('ss'),
      code_f140: o.lastSequentialMovement.movementReasonCode,
    },

    court_f141: (o.lastSequentialMovementIfOut.movementTypeCode === 'CRT' ? o.lastSequentialMovementIfOut.toAgencyLocation.agencyLocationId : undefined),
    escort_f142: (o.lastSequentialMovementIfOut.escortCode || {}).description,
    first_out_mov_post_adm_f143: helpers.optionalDate(o.earliestOutMovementDate.movementDateTime),
    employed_f144: (o.offenderEmployed ? 'Y' : 'N'),
    diary_details_f145: o.futureDiaryDetails.map(odd => helpers.formatOffenderDiaryDetail(odd, o)),
    licence_type_f146: o.offenderLicenses.map(ol => (ol.sentenceCalculationType || {}).description).join('~'),
    other_offences_f147: o.otherOffences.map(x => x.offenceCode).sort(),
    active_alerts_f148: o.activeAlerts.map(helpers.formatAlert),

    court: {
      type_f149: (o.courtOutcome.outcomeReason || {}).description,
      code_f150: (o.mostRecentConviction.agencyLocation || {}).agencyLocationId,
      name_f151: (o.mostRecentConviction.agencyLocation || {}).description,
    },

// 152	Activity Details
//     152a	Activity Description
//     152b	Activity Location
//     152c	Activity Start Hour
//     152d	Activity Start Min
//     152e	Activity End Hour
//     152f	Activity End Min

    tused_f153: helpers.optionalDate((o.offenderSentenceCalculationDates || {}).tused),
  };
};
