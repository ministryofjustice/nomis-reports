const moment = require('moment');
const helpers = require('./helpers');

const model = helpers.pipe([
  ['mainBooking', helpers.getMainBooking],
  ['mainAlias', helpers.getMainAlias],
  ['previousBookingNos', helpers.getPreviousBookings],
  ['offenderIdentifiers', helpers.mapOffenderIdentifiers],
  ['offenderSecurityCategory', helpers.getOffenderSecurityCategory],
  ['offenderSentence', helpers.getActiveOffenderSentence],
  ['offenderSentenceCalculations', helpers.getOffenderSentenceCalculations],
  ['offenderSentenceLength', helpers.getOffenderSentenceLength],
  ['offenderLicense', helpers.getOffenderLicense],
  ['offenderTransfers', helpers.getOffenderTransfers],
  ['firstOffenderTransfer', helpers.getFirstOffenderTransfer],
  ['lastOffenderTransfer', helpers.getLastOffenderTransfer],
  ['lastOffenderMovement', helpers.getLastOffenderMovement],
  ['firstOffenderOutMovement', helpers.getFirstOffenderOutMovement],
  ['pendingOffenderTransfer', helpers.getPendingOffenderTransfer],
  ['offenderCourtEscort', helpers.getOffenderCourtEscort],
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
  ['firstConviction', helpers.getFirstConviction],
  ['mostRecentConviction', helpers.getMostRecentConviction],
  ['firstSentence', helpers.getFirstSentence],
  ['courtOutcome', helpers.getCourtOutcome],
  ['highestRankedOffence', helpers.highestRankedOffence],
  ['otherOffences', helpers.otherOffences],
  ['earliestReleaseDate', helpers.earliestReleaseDate],
  ['custodyStatus', helpers.getCustodyStatus],
  ['maternityStatus', helpers.getMaternityStatus],
]);

module.exports.build = sysdate => data => {
  let o = model.apply(Object.assign({ sysdate }, data));

  return {
    sysdate_f1: o.sysdate,
    establishment_f2: "",
    estab_code_f3: o.mainBooking.agencyLocationId,
    nomis_id_f4: o.nomsId,
    gender_f5: o.mainAlias.sexCode,
    prison_no_f6: o.mainBooking.bookingNo,
    surname_f7: o.mainAlias.surname,
    forename1_f8: o.mainAlias.firstName,
    forename2_f9: o.mainAlias.middleNames,
    cro_f10: o.offenderIdentifiers.CRO,
    adult_yp_f11: helpers.formatAdultOrYouth(o.physicals.profileDetails.YOUTH),
    age_f12: helpers.getAge(o.mainAlias),
    dob_f13: helpers.optionalDate(o.mainAlias.dateOfBirth),
    nationality_f14: o.physicals.profileDetails.NAT,
    ethnicity_f15: o.mainAlias.raceCode,
    religion_f16: o.physicals.profileDetails.RELF,
    marital_f17: o.physicals.profileDetails.MARITAL,
    maternity_status_f18: o.maternityStatus.problemCode,
    location_f19: o.mainBooking.livingUnitId,
    incentive_band_f20: o.IEPLevel.iepLevel,
    occupation_v21: o.employments.occupationsCode,
    transfer_reason_f22: helpers.formatTransferReasonCode(o.firstOffenderTransfer),
    first_reception_date_f23: helpers.optionalDate(o.mainBooking.startDate),
    custody_status_f24: o.custodyStatus,
    inmate_status_f25: o.imprisonmentStatus.imprisonmentStatusCode,

    sec_cat: {
      level_f26: o.offenderSecurityCategory.reviewSupLevelType,
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

    date_of_first_conviction_40: helpers.optionalDate(o.firstConviction.startDateTime),
    date_first_sentenced_f41: helpers.optionalDate(o.firstSentence.startDate),
    f2052_status_42: o.checkHoldAlerts.H_HA,
    highest_ranked_offence_f43: o.highestRankedOffence.offenceCode,
    // 44	Status Rank (to be left blank)
    pending_transfers_f45: o.pendingOffenderTransfer.toAgencyLocationId,
    received_from_f46: o.pendingOffenderTransfer.fromAgencyLocationId,
    vulnerable_prisoner_alert_f47: o.checkHoldAlerts.VUL,
    pnc_f48: o.offenderIdentifiers.PNC,

    emplmnt_status: {
      discharge_f49: o.dischargeEmployment.employmentPostCode,
      reception_f50: o.receptionEmployment.employmentPostCode,
    },

    schedule_1_sex_offender_f51: helpers.formatAlert(o.MAPPA),
    sex_offender_f52: (o.isSexOffender ? 'Y' : 'N'),
    supervising_service_f53: helpers.formatSupervisingService(o.offenderManager),
    height_metres_f54: helpers.optionalHeight(o.physicals.physicalAttributes.heightCm),
    complexion_f55: o.physicals.profileDetails.COMPL,
    hair_f56: o.physicals.profileDetails.HAIR,
    left_eye_f57: o.physicals.profileDetails.L_EYE_C,
    right_eye_f58: o.physicals.profileDetails.R_EYE_C,
    build_f59: o.physicals.profileDetails.BUILD,
    face_f60: o.physicals.profileDetails.FACE,
    facial_hair_f61: o.physicals.profileDetails.FACIAL_HAIR,

    marks: {
      head_f62: o.physicals.identifyingMarks.HEAD.map(helpers.formatIdentifyingMark),
      body_f63: o.physicals.identifyingMarks.BODY.map(helpers.formatIdentifyingMark),
    },

    sentence_length_f64: o.offenderSentenceLength,

    release: {
      date_f65: helpers.optionalDate(o.releaseDetails.releaseDate),
      name_f66: helpers.formatReleaseReason(o.releaseDetails),
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
      start_f77: o.checkHoldAlerts.SH_Date,
    },

    discharge: {
      nfa_f78: helpers.getNFA(o.offenderDischargeAddress),
      address1_f79: helpers.formatAddressLine1(o.offenderDischargeAddress),
      address2_f80: o.offenderDischargeAddress.locality,
      address3_f81: o.offenderDischargeAddress.cityCode,
      address4_f82: o.offenderDischargeAddress.countyCode,
      address5_f83: o.offenderDischargeAddress.countryCode,
      address6_f84: o.offenderDischargeAddress.postalCode,
      address7_f85: o.offenderDischargeAddress.phoneNo,
    },

    reception:{
      nfa_f86: helpers.getNFA(o.offenderReceptionAddress),
      address1_f87: helpers.formatAddressLine1(o.offenderReceptionAddress),
      address2_f88: o.offenderReceptionAddress.locality,
      address3_f89: o.offenderReceptionAddress.cityCode,
      address4_f90: o.offenderReceptionAddress.countyCode,
      address5_f91: o.offenderReceptionAddress.countryCode,
      address6_f92: o.offenderReceptionAddress.postalCode,
      address7_f93: o.offenderReceptionAddress.phoneNo,
    },

    home: {
      address1_f94: helpers.formatAddressLine1(o.offenderHomeAddress),
      address2_f95: o.offenderHomeAddress.locality,
      address3_f96: o.offenderHomeAddress.cityCode,
      address4_f97: o.offenderHomeAddress.countyCode,
      address5_f98: o.offenderHomeAddress.countryCode,
      address6_f99: o.offenderHomeAddress.postalCode,
      address7_f100: o.offenderHomeAddress.phoneNo,
    },

    nok: {
      name_f101: helpers.formatContactPersonName(o.nextOfKin),
      nfa_f102: helpers.formatContactPersonRelationship(o.nextOfKin),
      address1_f103: (o.nextOfKin && o.nextOfKin.primaryAddress && helpers.formatAddressLine1(o.nextOfKin.primaryAddress)),
      address2_f104: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.locality),
      address3_f105: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.cityCode),
      address4_f106: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.countyCode),
      address5_f107: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.countryCode),
      address6_f108: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.postalCode),
      address7_f109: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.phoneNo),
    },

    prob: {
      name_f110: helpers.formatContactPersonName(o.offenderManager),
      address1_f111: (o.offenderManager && o.offenderManager.primaryAddress && helpers.formatAddressLine1(o.offenderManager.primaryAddress)),
      address2_f112: (o.offenderManager && o.offenderManager.primaryAddress && o.offenderManager.primaryAddress.locality),
      address3_f113: (o.offenderManager && o.offenderManager.primaryAddress && o.offenderManager.primaryAddress.cityCode),
      address4_f114: (o.offenderManager && o.offenderManager.primaryAddress && o.offenderManager.primaryAddress.countyCode),
      address5_f115: (o.offenderManager && o.offenderManager.primaryAddress && o.offenderManager.primaryAddress.countryCode),
      address6_f116: (o.offenderManager && o.offenderManager.primaryAddress && o.offenderManager.primaryAddress.postalCode),
      address7_f117: (o.offenderManager && o.offenderManager.primaryAddress && o.offenderManager.primaryAddress.phoneNo),
    },

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

    sending_estab_f134: o.lastOffenderTransfer.fromAgencyLocationId,
    reason_f135: o.lastOffenderTransfer.movementReasonCode,

    movement: {
      date_f136: helpers.optionalDate(o.lastOffenderMovement.movementDateTime),
      hour_f137: moment(o.lastOffenderMovement.movementDateTime).format('HH'),
      min_f138: moment(o.lastOffenderMovement.movementDateTime).format('mm'),
      sec_f139: moment(o.lastOffenderMovement.movementDateTime).format('ss'),
      code_f140: o.lastOffenderMovement.movementReasonCode,
    },

    court_f141: o.offenderCourtEscort.toAgencyLocationId,
    escort_f142: o.offenderCourtEscort.escortCode,
    first_out_mov_post_adm_f143: helpers.optionalDate(o.firstOffenderOutMovement.movementDateTime),
// 144	Employed
    diary_details_f145: helpers.withList(o.diaryDetails).map(odd => helpers.formatOffenderDiaryDetail(odd, o)),
    licence_type_f146: helpers.formatLicenseType(o.offenderLicense),
    other_offences_f147: o.otherOffences.map(x => x.offenceCode).sort(),
    active_alerts_f148: o.activeAlerts.map(helpers.formatAlert),

    court: {
      type_f149: o.courtOutcome.outcomeReasonCode,
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
