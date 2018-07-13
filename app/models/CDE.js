const moment = require('moment');
const helpers = require('./helpers');
const refData = require('./refData');

const modelAddress = (base, n, a) => {
  if (!base && !a) {
    return;
  }

  let out = Object.assign({}, base);

  if (a) {
    out[`address1_f${n}`] = helpers.formatAddressLine1(a);
    out[`address2_f${n + 1}`] = a.locality;

    if (a.city) {
      out[`address3_f${n + 2}`] = (a.city || {}).description;
    }

    if (a.county) {
      out[`address4_f${n + 3}`] = (a.county || {}).description;
    }

    if (a.country) {
      out[`address5_f${n + 4}`] = (a.country || {}).description;
    }

    out[`address6_f${n + 5}`] = a.postalCode;
    out[`address7_f${n + 6}`] = a.phoneNo;
  }

  return out;
};

const sortAssessments = o => {
  return (o.assessments.slice() || []).sort((a, b) => b.assessmentSequence - a.assessmentSequence); // DESC
};

const model = helpers.pipe([
  ['mainBooking', helpers.getMainBooking],
  ['mainAlias', helpers.getMainAlias],
  ['sequentialAssessments', sortAssessments],
  ['previousBookingNos', helpers.getPreviousBookings],
  ['offenderIdentifiers', helpers.mapOffenderIdentifiers],
  ['offenderSecurityCategory', helpers.getOffenderSecurityCategory],
  ['offenderSentence', helpers.getActiveOffenderSentence],
  ['offenderSentenceCalculations', helpers.getOffenderSentenceCalculations],
  ['offenderSentenceLength', helpers.getOffenderSentenceLength],
  ['offenderLicense', helpers.getOffenderLicense],
  ['lastSequentialTransfer', helpers.getLastSequentialTransfer],
  ['activeTransfers', helpers.getActiveTransfers],
  ['lastSequentialMovementIfOut', helpers.getLastSequentialMovementIfOut],
  ['earliestOutMovementDate', helpers.getEarliestOutMovementDate],
  ['lastSequentialMovement', helpers.getLastSequentialMovement],
  ['offenderSentenceCalculationDates', helpers.getOffenderSentenceCalculationDates],
  ['offenderEmployments', helpers.getOffenderEmployments],
  ['offenderCharges', helpers.getCharges],
  ['offenderContactPersons', helpers.getContactPersons],
  ['offenderHomeAddress', helpers.getOffenderHomeAddress],
  ['offenderReceptionAddress', helpers.getOffenderReceptionAddress],
  ['offenderDischargeAddress', helpers.getOffenderDischargeAddress],
  ['nextOfKin', helpers.getNextOfKin],
  ['offenderManager', helpers.getOffenderManager],
  ['activeAlerts', helpers.getActiveAlerts],
  ['notForRelease', helpers.getNotForReleaseAlerts],
  ['MAPPA', helpers.getMAPPAAlerts],
  ['checkHoldAlerts', helpers.getCheckHoldAlerts],
  ['physicals', helpers.getPhysicals],
  ['IEPLevel', helpers.getIEPLevel],
  ['employments', helpers.getEmployment],
  ['dischargeEmployment', helpers.dischargeEmployment],
  ['receptionEmployment', helpers.receptionEmployment],
  ['imprisonmentStatus', helpers.getImprisonmentStatus],
  ['releaseDetails', helpers.getReleaseDetails],
  ['isSexOffender', helpers.isSexOffender],
  ['mostRecentConviction', helpers.getMostRecentConviction],
  ['earliestSentenceAndConviction', helpers.getEarliestSentenceAndConviction],
  ['courtOutcome', helpers.getCourtOutcome],
  ['highestRankedOffence', helpers.highestRankedOffence],
  ['otherOffences', helpers.getOtherOffences],
  ['earliestReleaseDate', helpers.getEarliestReleaseDate],
  ['custodyStatus', helpers.getCustodyStatus],
  ['maternityStatus', helpers.getMaternityStatus],
]);


const buildModel = module.exports.buildModel = sysdate => data => {
  return model.apply(Object.assign({ sysdate }, data));
};

module.exports.build = sysdate => data => {
  let o = buildModel(sysdate)(data);

  return {
    sysdate_f1: o.sysdate,
    establishment_f2: "",
    estab_code_f3: o.mainBooking.agencyLocationId,
    nomis_id_f4: o.nomsId,
    gender_f5: (o.mainAlias.gender || {}).description,
    prison_no_f6: o.mainBooking.bookingNo,
    surname_f7: o.mainAlias.surname,
    forename1_f8: o.mainAlias.firstName,
    forename2_f9: o.mainAlias.middleNames,
    cro_f10: o.offenderIdentifiers.CRO,
    adult_yp_f11: (o.physicals.profileDetails.YOUTH || {}).description,
    age_f12: helpers.getAge(o.mainAlias),
    dob_f13: helpers.optionalDate(o.mainAlias.dateOfBirth),
    nationality_f14: (o.physicals.profileDetails.NAT || {}).description,
    ethnicity_f15: (o.mainAlias.ethnicity || {}).description,
    religion_f16: (o.physicals.profileDetails.RELF || {}).description,
    marital_f17: (o.physicals.profileDetails.MARITAL || {}).description,
    maternity_status_f18: (o.maternityStatus.problemCode || {}).description,
    location_f19: o.mainBooking.livingUnitId,
    incentive_band_f20: (o.IEPLevel.iepLevel || {}).description,
    occupation_v21: (o.employments.occupationsCode || {}).description,
    transfer_reason_f22: o.lastSequentialTransfer.movementReasonDescription,
    first_reception_date_f23: helpers.optionalDate(o.mainBooking.startDate),
    custody_status_f24: o.custodyStatus,
    inmate_status_f25: (o.imprisonmentStatus.imprisonmentStatus || {}).description,

    sec_cat: {
      level_f26: (o.offenderSecurityCategory.reviewSupLevelType || {}).description,
      next_review_f27: helpers.optionalDate(o.offenderSecurityCategory.nextReviewDate),
    },

    sentence: {
      years_f28: parseInt((o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[0] || 0, 10),
      months_f29: parseInt((o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[1] || 0, 10),
      days_f30: parseInt((o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[2] || 0, 10),
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
    pending_transfers_f45: (o.activeTransfers[0] || {}).toAgencyLocationId,
    received_from_f46: (o.activeTransfers[0] || {}).fromAgencyLocationId,
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
      date_f65: helpers.optionalDate((o.releaseDetails[0] || {}).releaseDate),
      name_f66: (o.releaseDetails[0] || {}).movementReasonDescription,
    },

    sed_f67: o.offenderSentenceCalculationDates.sed,
    hdced_f68: o.offenderSentenceCalculationDates.hdced,
    hdcad_f69: o.offenderSentenceCalculationDates.hdcad,
    ped_f70: o.offenderSentenceCalculationDates.ped,
    crd_f71: o.offenderSentenceCalculationDates.crd,
    npd_f72: o.offenderSentenceCalculationDates.npd,
    led_f73: o.offenderSentenceCalculationDates.led,
    date_sec_cat_changed_f74: helpers.optionalDate(o.offenderSecurityCategory.evaluationDate),
    rule_45_yoi_rule_46_f75: o.checkHoldAlerts.V_45_46,

    f2052sh: {
      alert_f76: o.checkHoldAlerts.SH_STS,
      start_f77: helpers.optionalDate(o.checkHoldAlerts.SH_Date),
    },

    discharge: modelAddress({
        nfa_f78: helpers.getNFA(o.offenderDischargeAddress)
      }, 79, o.offenderDischargeAddress),

    reception: modelAddress({
        nfa_f86: helpers.getNFA(o.offenderReceptionAddress)
      }, 87, o.offenderReceptionAddress),

    home: modelAddress({
      }, 94, o.offenderHomeAddress),

    nok: modelAddress({
        name_f101: helpers.formatContactPersonName(o.nextOfKin),
        nfa_f102: helpers.formatContactPersonRelationship(o.nextOfKin)
      }, 103, o.nextOfKin ? o.nextOfKin.primaryAddress : undefined),

    prob: modelAddress({
        name_f110: helpers.formatContactPersonName(o.offenderManager)
      }, 111, o.offenderManager ? o.offenderManager.primaryAddress : undefined),

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

    sending_estab_f134: o.lastSequentialTransfer.fromAgencyLocationId,
    reason_f135: o.lastSequentialTransfer.movementReasonDescription,

    movement: {
      date_f136: helpers.optionalDate(o.lastSequentialMovement.movementDateTime),
      hour_f137: moment(o.lastSequentialMovement.movementDateTime).format('HH'),
      min_f138: moment(o.lastSequentialMovement.movementDateTime).format('mm'),
      sec_f139: moment(o.lastSequentialMovement.movementDateTime).format('ss'),
      code_f140: o.lastSequentialMovement.movementReasonCode,
    },

    court_f141: (o.lastSequentialMovementIfOut.movementTypeCode === 'CRT' ? o.lastSequentialMovementIfOut.toAgencyLocationId : undefined),
    escort_f142: (o.lastSequentialMovementIfOut.escortCode || {}).description,
    first_out_mov_post_adm_f143: helpers.optionalDate(o.earliestOutMovementDate.movementDateTime),
// 144	Employed
    diary_details_f145: helpers.withList(o.diaryDetails).map(odd => helpers.formatOffenderDiaryDetail(odd, o)),
    licence_type_f146: (o.offenderLicense.sentenceCalculationType || {}).description,
    other_offences_f147: o.otherOffences.map(x => x.offenceCode).sort(),
    active_alerts_f148: o.activeAlerts.map(helpers.formatAlert),

    court: {
      type_f149: (o.courtOutcome.outcomeReason || {}).description,
      code_f150: o.mostRecentConviction.agencyLocationId,
      name_f151: "",
    },

// 152	Activity Details
//     152a	Activity Description
//     152b	Activity Location
//     152c	Activity Start Hour
//     152d	Activity Start Min
//     152e	Activity End Hour
//     152f	Activity End Min

    tused_f153: helpers.optionalDate(o.offenderSentenceCalculationDates.tused),
  };
};
