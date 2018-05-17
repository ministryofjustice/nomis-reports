const moment = require('moment');
const helpers = require('../helpers');

const getFirst = a => a[0] || {};
const getLast = a => a[a.length - 1] || {};
const withList = a => a || [];

const getOffenderTransfers = o =>
  withList(o.movements)
    .filter(oem => (
      oem.bookingId === o.mainBooking.bookingId &&
      oem.movementTypeCode === 'TRN'
    ));

const getOffenderEmployments = o =>
  withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      oe.employmentDate &&
      !oe.terminationDate
    ));

const getCharges = o =>
  withList(o.charges)
    .filter(oc => (
      oc.bookingId === o.mainBooking.bookingId
    ));

const getContactPersons = o =>
  withList(o.contactPersons)
    .filter(ocp => (
      ocp.bookingId === o.mainBooking.bookingId &&
      ocp.active &&
      !getFirst(withList(ocp.addresses)).endDate
    ));

const getReleaseDetails = o =>
  withList(o.releaseDetails)
    .filter(ord => (
      ord.bookingId === o.mainBooking.bookingId
    ));

const getOffenderSentenceCalculations = o =>
  withList(o.sentenceCalculations)
    .filter(s => (
      s.bookingId === o.mainBooking.bookingId
    ))
    .reduce((a, b) => (
      !a.effectiveSentenceEndDate ||
      moment(b.effectiveSentenceEndDate).diff(a.effectiveSentenceEndDate) > 0 ? b : a
    ), moment(0)) || {};

const getOffenderSentence = o =>
  getFirst(withList(o.offenderSentences)
    .reduce((a, b) => (
      !a.startDate ||
      moment(b.startDate).diff(a.startDate) > 0 ? b : a
    ), moment(0)) || {});

const getOffenderLicense = o =>
  getFirst(withList(o.offenderSentences)
    .filter(s => (
      s.sentenceCategory === 'LICENSE'
    )));

const getActiveOffenderAddresses = o =>
  withList(o.addresses)
    .filter(oa => (
      !oa.endDate &&
      oa.active
    ));

const mapOffenderIdentifiers = o =>
  withList(o.identifiers)
    .reduce((x, oi) => {
      x[oi.identifierType] = oi.identifier;
      return x;
    }, {});

const getMaternityStatus = (o, sysdate) =>
  getFirst(withList(o.healthProblems)
    .filter(hp => (
      hp.bookingId === o.mainBooking.bookingId &&
      hp.problemType === 'MATSTAT' &&
      hp.problemStatus === 'ON' &&
    //hp.domain === 'HEALTH_PBLM' &&
      (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
    )));

const getOffenderSecurityCategory = o =>
  getFirst(withList(o.assessments)
    .filter(oa => (
      oa.bookingId === o.mainBooking.bookingId &&
      oa.evaluationResultCode === 'APP' &&
      oa.assessStatus === 'A' &&
      oa.assessmentType &&
      oa.assessmentType.assessmentClass === 'TYPE' &&
      oa.assessmentType.assessmentCode === 'CATEGORY' &&
      oa.assessmentType.determineSupLevelFlag === 'Y'
    )));

const getLastOffenderMovement = o =>
  getFirst(o.movements);

const getFirstOffenderTransfer = o =>
  getLast(o.OffenderTransfers);

const getLastOffenderTransfer = o =>
  getFirst(o.OffenderTransfers);

const getPendingOffenderTransfer = o =>
  getLast(withList(o.OffenderTransfers)
    .filter(m => m.active));

const getOffenderCourtEscort = o =>
  getFirst(withList(o.OffenderTransfers)
    .filter(m => (
      m.movementType === 'CRT' &&
      m.directionCode === 'OUT'
    )));

const getFirstOffenderOutMovement = o =>
  getLast(withList(o.movements)
    .filter(m => (
      m.directionCode === 'OUT'
    )));

const receptionEmployment = o =>
  getLast(o.offenderEmployments);

const dischargeEmployment = o =>
  getFirst(o.offenderEmployments);

const highestRankedOffence = o =>
  getFirst(o.offenderCharges);

const otherOffences = o =>
  withList(o.offenderCharges)
    .filter((o, i) => i !== 0);

const getOffenderHomeAddress = o =>
  getFirst(withList(o.offenderAddresses)
    .filter(a => (a.addressUsage === 'HOME')));

const getOffenderReceptionAddress = o =>
  getFirst(withList(o.offenderAddresses)
    .filter(a => (a.addressUsage === 'RECEP')));

const getOffenderDischargeAddress = o =>
  getFirst(withList(o.offenderAddresses)
    .filter(a => (~['RELEASE','DNF','DUT','DST','DPH','DSH','DAP','DBA','DOH','DBH'].indexOf(a.addressUsage))));

const getMainBooking = o =>
  getFirst(o.bookings);

const getPreviousBookings = o =>
  withList(o.bookings)
    .reduce((a, b) => {
      if (!~a.indexOf(b.bookingNo)) {
        a.push(b.bookingNo);
      }
      return a;
    }, []);

const getActiveAlerts = o =>
  withList(o.alerts)
    .filter(oa => !oa.expired);

// Multi Agency Public Protection Alert
const getMAPPAAlerts = o =>
  getFirst(withList(o.alerts)
    .filter(oa => (
      !oa.expired &&
      oa.alertType === 'P'
    )));

const getNotForReleaseAlerts = o =>
  getFirst(withList(o.alerts)
    .filter(oa => (
      !oa.expired &&
      oa.alertType === 'X' /*&&
      oa.alertStatus === 'ACTIVE'
      */
    )));

const getAge = o =>
  moment().diff(moment(o.dateOfBirth), 'years');

const getNextOfKin = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.nextOfKin
    )));

const getOffenderManager = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.contactPersonType.contactType === 'O' &&
      ocp.contactPersonType.relationshipType === 'PROB'
    )));

const formatTransferReasonCode = trn =>
  trn ? [trn.movementType, trn.movementReasonCode]
    .filter(x => !!x)
    .join('-') : undefined;

const formatReleaseReason = ord =>
  ord ? [ord.movementType, ord.movementReasonCode]
    .filter(x => !!x)
    .join('-') : undefined;

const formatLicenseType = os =>
  os ? [os.sentenceCategory, os.sentenceCalcType]
    .filter(x => !!x)
    .join('-') : undefined;

const formatAddressLine1 = a =>
  a ? [a.flat, a.premise, a.street]
    .filter(x => !!x)
    .join(' ') : undefined;

const formatAlert = oa =>
  oa ? [oa.alertType, oa.alertCode]
    .filter(x => !!x)
    .join('-') : undefined;

const formatIdentifyingMark = oim =>
  oim ? [oim.markType, oim.bodyPartCode]
    .filter(x => !!x)
    .join(' ') : undefined;

const formatContactPersonName = ocp =>
  ocp && ocp.person ? [ocp.person.lastName, ocp.person.firstName]
    .filter(x => !!x)
    .join(' ') : undefined;

const formatContactPersonRelationship = ocp =>
  ocp ? (['Y', 'NFA'].indexOf(ocp.noFixedAddress) ? ocp.noFixedAddress : null) : undefined;

const formatOffenderDiaryDetail = (odd, o) =>
  ({
    date_145a: moment(odd.movementDateTime),
    time_145b: moment(odd.movementDateTime).format('HH:mm:ss'),
    reason_code_145c: odd.movementReasonCode || "",
    comment_text_145d: odd.comments || "",
    escort_type_145e: odd.escortType || "",
    not_for_release_alert_145f: formatAlert(o.notForRelease),
  });

const getCustodyStatus = data => {
  let mainBooking = getFirst(withList(data.bookings));

  let stat = {
    statusReason: (mainBooking.statusReason || "").substring(5),
    inTransit: (mainBooking.inOutStatus || "").toUpperCase() === 'TRN',
    isActive: (mainBooking.activeFlag || false),
    bookingSequence: mainBooking.bookingSequence,
  };

  if (stat.isActive) {
    return 'Active';
  }

  if (stat.inTransit) {
    return 'In Transit';
  }

  if (!stat.isActive) {
    if (~['ESCP', 'UAL'].indexOf(stat.statusReason)) {
      return 'UAL';
    } else if (~['UAL_ECL'].indexOf(stat.statusReason)) {
      return 'UAL_ECL';
    } else {
      return stat.inOutStatus;
    }

    if (stat.bookingSequence === 1) {
      return 'INACTIVE';
    } else if (stat.bookingSequence > 1) {
      return 'HISTORIC';
    }
  }
};

const earliestReleaseDate =  o =>
  (scd => [
    scd.hdced,
    scd.hdcad,
    scd.etd,
    scd.mtd,
    scd.ltd,
    scd.crd,
    scd.ped,
    scd.apd,
    scd.npd,
    scd.ard
  ].sort((a, b) => a.diff(b))[0])(o.offenderSentenceCalculationDates);

const getOffenderSentenceCalculationDates = o =>
  (osc => ({
    sed: moment(osc.sedOverridedDate || osc.sedCalculatedDate),
    hdced: moment(osc.hdcedOverridedDate || osc.hdcedCalculatedDate),
    hdcad: moment(osc.hdcadOverridedDate || osc.hdcadCalculatedDate),
    etd: moment(osc.etdOverridedDate || osc.etdCalculatedDate),
    mtd: moment(osc.mtdOverridedDate || osc.mtdCalculatedDate),
    ltd: moment(osc.ltdOverridedDate || osc.ltdCalculatedDate),
    crd: moment(osc.crdOverridedDate || osc.crdCalculatedDate),
    ped: moment(osc.pedOverridedDate || osc.pedCalculatedDate),
    apd: moment(osc.apdOverridedDate || osc.apdCalculatedDate),
    npd: moment(osc.npdOverridedDate || osc.npdCalculatedDate),
    ard: moment(osc.ardOverridedDate || osc.ardCalculatedDate),
    led: moment(osc.ledOverridedDate || osc.ledCalculatedDate),
    tused: moment(osc.tusedOverridedDate || osc.tusedCalculatedDate)
  }))(o.offenderSentenceCalculations);

const getNFA = oa => {
  if (~['RELEASE', 'HOME', 'RECEP'].indexOf(oa.addressUsage)) {
    return oa.noFixedAddress ? 'NFA' : undefined;
  }

  return oa.addressUsage;
};

const getCheckHoldAlerts = o =>
  withList(o.activeAlerts)
    .reduce((x, oa) => {
      let fa = formatAlert(oa);
      switch (fa) {
        case 'T-TG': return x.T_TG = fa;
        case 'T-TAH': return x.T_TAH = fa;
        case 'T-TSE': return x.T_TSE = fa;
        case 'T-TM': return x.T_TM = fa;
        case 'T-TPR': return x.T_TPR = fa;
        case 'H-HA': return x.H_HA = fa;
      }

      if (oa.alertType === 'V') {
        if (~['V45','VOP','V46','V49G','V49P'].indexOf(oa.alertCode)) {
          x.V_45_46 = 'Y';
        } else {
          x.VUL = 'Y';
        }
      }

      if (fa === 'H-HA') {
        x.SH_STS = 'Y';
        x.SH_Date = oa.alertDate;
      }

      return x;
    }, { VUL: 'N', V_45_46: 'N', SH_STS: 'N' });

const getPhysicals = o => {
  let physicals = getFirst(withList(o.physicals)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    )));

  return {
    profileDetails: withList(physicals.profileDetails)
        .reduce((x, opd) => {
          x[opd.profileType] = opd.profileCode;
          return x;
        }, {}),
    identifyingMarks: (x => {
      x.BODY = [...(x.BODY || [])];
      x.HEAD = [...(x.HEAD || [])];
      return x;
    })(withList(physicals.identifyingMarks)
        .reduce((x, oim) => {
          let area = (~[ 'EAR', 'FACE', 'HEAD', 'LIP', 'NECK', 'NOSE' ].indexOf(oim.bodyPartCode)) ? 'HEAD' : 'BODY';
          /*
          area = (~[
            'ANKLE', 'ARM', 'ELBOW', 'FINGER', 'FOOT', 'HAND', 'KNEE', 'LEG', 'SHOULDER', 'THIGH', 'TOE', 'TORSO'
          ].indexOf(oim.bodyPartCode)) ? 'BODY' : 'HEAD';
          */

          (x[area] = x[area] || new Set()).add(formatIdentifyingMark(oim));

          return x;
        }, {})),
    physicalAttributes: withList(physicals.physicalAttributes)
        .reduce((x, opa) => (x || opa), false),
  };
};

const getIEPLevel = o =>
  getFirst(withList(o.IEPs)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    ))
    .map(iep => iep.iepLevel));

const getEmployment = o =>
  getFirst(withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      (oe.terminationDate || moment(oe.terminationDate).diff(o.mainBooking.startDate) > 0)
    )));

const getImprisonmentStatus = o =>
  getFirst(withList(o.imprisonmentStatuses)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    )));

const isSexOffender = o =>
  withList(o.charges)
    .filter(oc => ~withList(oc.offenceIndicatorCodes).indexOf('S')).length > 0;

const getFirstConviction = o =>
  getLast(withList(o.courtEvents));

const getMostRecentConviction = o =>
  getFirst(withList(o.courtEvents));

const getFirstSentence = o =>
  getFirst(withList(getFirst(withList(
    getLast(withList(o.courtEvents).filter(ce => withList(getFirst(withList(ce.courtEventCharges)).sentences).length > 0))
    .courtEventCharges)).sentences));

const getCourtOutcome = o =>
  getFirst(withList(o.courtEvents)
    .filter(ce =>
      ce.bookingId === o.mainBooking.bookingId &&
      ce.directionCode === 'OUT'
    ));

module.exports.build = sysdate => data => {
  let o = [
    ['sysdate', () => sysdate],
    ['mainBooking', getMainBooking],
    ['previousBookingNos', getPreviousBookings],
    ['offenderIdentifiers', mapOffenderIdentifiers],
    ['offenderSecurityCategory', getOffenderSecurityCategory],
    ['offenderSentenceCalculations', getOffenderSentenceCalculations],
    ['offenderSentence', getOffenderSentence],
    ['offenderLicense', getOffenderLicense],
    ['OffenderTransfers', getOffenderTransfers],
    ['firstOffenderTransfer', getFirstOffenderTransfer],
    ['lastOffenderTransfer', getLastOffenderTransfer],
    ['lastOffenderMovement', getLastOffenderMovement],
    ['firstOffenderOutMovement', getFirstOffenderOutMovement],
    ['pendingOffenderTransfer', getPendingOffenderTransfer],
    ['offenderCourtEscort', getOffenderCourtEscort],
    ['offenderSentenceCalculationDates', getOffenderSentenceCalculationDates],
    ['offenderEmployments', getOffenderEmployments],
    ['offenderCharges', getCharges],
    ['offenderContactPersons', getContactPersons],
    ['offenderAddresses', getActiveOffenderAddresses],
    ['offenderHomeAddresses', getOffenderHomeAddress],
    ['offenderReceptionAddresses', getOffenderReceptionAddress],
    ['offenderDischargeAddresses', getOffenderDischargeAddress],
    ['nextOfKin', getNextOfKin],
    ['offenderManager', getOffenderManager],
    ['activeAlerts', getActiveAlerts],
    ['notForRelease', getNotForReleaseAlerts],
    ['MAPPA', getMAPPAAlerts],
    ['checkHoldAlerts', getCheckHoldAlerts],
    ['physicals', getPhysicals],
    ['IEPLevel', getIEPLevel],
    ['employments', getEmployment],
    ['imprisonmentStatus', getImprisonmentStatus],
    ['releaseDetails', getReleaseDetails],
    ['isSexOffender', isSexOffender],
    ['firstConviction', getFirstConviction],
    ['mostRecentConviction', getMostRecentConviction],
    ['firstSentence', getFirstSentence],
    ['courtOutcome', getCourtOutcome],
  ].reduce((x, p) => { x[p[0]] = p[1](x); return x; }, Object.assign({}, data));

  let model = {
    sysdate_f1: o.sysdate,
    establishment_f2: "",
    estab_code_f3: o.mainBooking.agencyLocationId,
    nomis_id_f4: o.nomsId,
    gender_f5: o.sexCode,
    prison_no_f6: o.mainBooking.bookingNo,
    surname_f7: o.surname,
    forename1_f8: o.firstName,
    forename2_f9: o.middleNames,
    cro_f10: o.offenderIdentifiers.CRO,
    adult_yp_f11: o.physicals.profileDetails.YOUTH,
    age_f12: getAge(o),
    dob_f13: moment(o.dateOfBirth),
    nationality_f14: o.physicals.profileDetails.NAT,
    ethnicity_f15: o.raceCode,
    religion_f16: o.physicals.profileDetails.RELF,
    marital_f17: o.physicals.profileDetails.MARITAL,
    maternity_status_f18: getMaternityStatus(o, o.sysdate).problemCode,
    location_f19: o.mainBooking.livingUnitId,
    incentive_band_f20: o.IEPLevel.iepLevel,
    occupation_v21: o.employments.occupationsCode,
    transfer_reason_f22: formatTransferReasonCode(o.firstOffenderTransfer),
    first_reception_date_f23: moment(o.mainBooking.startDate),
    custody_status_f24: getCustodyStatus(o),
    inmate_status_f25: o.imprisonmentStatus.imprisonmentStatus,
    sec_cat_f26: o.offenderSecurityCategory.reviewSupLevelType,
    sec_cat_next_review_f27: moment(o.offenderSecurityCategory.nextReviewDate),
    sentence_years_f28: (o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[0],
    sentence_months_f29: (o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[1],
    sentence_days_f30: (o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[2],
    previous_prison_no_f31: o.previousBookingNos,
    earliest_release_date_f32: earliestReleaseDate(o),
    check_hold_governor_f33: o.checkHoldAlerts.T_TG,
    // 34	Check Hold General (to be left blank)
    // 35	Check Hold Discipline (to be left blank)
    check_hold_allocation_36: o.checkHoldAlerts.T_TAH,
    check_hold_security_37: o.checkHoldAlerts.T_TSE,
    check_hold_medical_38: o.checkHoldAlerts.T_TM,
    check_hold_parole_39: o.checkHoldAlerts.T_TPR,
    date_of_first_conviction_40: moment(o.firstConviction.startDateTime),
    date_first_sentenced_f41: moment(o.firstSentence.startDate),
    f2052_status_42: o.checkHoldAlerts.H_HA,
    highest_ranked_offence_f43: highestRankedOffence(o).offenceCode,
    // 44	Status Rank (to be left blank)
    pending_transfers_f45: o.pendingOffenderTransfer.toAgencyLocationId,
    received_from_f46: o.pendingOffenderTransfer.fromAgencyLocationId,
    vulnerable_prisoner_alert_f47: o.checkHoldAlerts.VUL,
    pnc_f48: o.offenderIdentifiers.PNC,
    emplmnt_status_discharge_f49: dischargeEmployment(o).employmentPostCode,
    emplmnt_status_reception_f50: receptionEmployment(o).employmentPostCode,
    schedule_1_sex_offender_f51: formatAlert(o.MAPPA),
    sex_offender_f52: (o.isSexOffender ? 'Y' : 'N'),
    supervising_service_f53: (o.offenderManager && o.offenderManager.address),
    height_metres_f54: o.physicals.physicalAttributes.heightCM / 100,
    complexion_f55: o.physicals.profileDetails.COMPL,
    hair_56: o.physicals.profileDetails.HAIR,
    left_eye_57: o.physicals.profileDetails.L_EYE_C,
    right_eye_58: o.physicals.profileDetails.R_EYE_C,
    build_59: o.physicals.profileDetails.BUILD,
    face_60: o.physicals.profileDetails.FACE,
    facial_hair_61: o.physicals.profileDetails.FACIAL_HAIR,
    marks_head_f62: o.physicals.identifyingMarks.HEAD,
    marks_body_f63: o.physicals.identifyingMarks.BODY,
    sentence_length_f64: moment(o.offenderSentenceCalculations.effectiveSentenceEndDate).diff(moment(o.offenderSentence.startDate), 'years'),
    release_date_f65: moment(o.releaseDetails.releaseDate),
    release_name_f66: formatReleaseReason(o.releaseDetails),
    sed_f67: o.offenderSentenceCalculationDates.sed,
    hdced_f68: o.offenderSentenceCalculationDates.hdced,
    hdcad_f69: o.offenderSentenceCalculationDates.hdcad,
    ped_f70: o.offenderSentenceCalculationDates.ped,
    crd_f71: o.offenderSentenceCalculationDates.crd,
    npd_f72: o.offenderSentenceCalculationDates.npd,
    led_f73: o.offenderSentenceCalculationDates.led,
    date_sec_cat_changed_f74: o.offenderSecurityCategory.evaluationDate,
    rule_45_yoi_rule_46_f75: o.checkHoldAlerts.V_45_46,
    f2052sh_f76: o.checkHoldAlerts.SH_STS,
    f2052_start_f77: o.checkHoldAlerts.SH_Date,

    discharge_nfa_f78: getNFA(o.offenderDischargeAddresses),
    discharge_address1_f79: formatAddressLine1(o.offenderDischargeAddresses),
    discharge_address2_f80: o.offenderDischargeAddresses.locality,
    discharge_address3_f81: o.offenderDischargeAddresses.cityCode,
    discharge_address4_f82: o.offenderDischargeAddresses.countyCode,
    discharge_address5_f83: o.offenderDischargeAddresses.countryCode,
    discharge_address6_f84: o.offenderDischargeAddresses.postalCode,
    discharge_address7_f85: o.offenderDischargeAddresses.phoneNo,

    reception_nfa_f86: getNFA(o.offenderReceptionAddresses),
    reception_address1_f87: formatAddressLine1(o.offenderReceptionAddresses),
    reception_address2_f88: o.offenderReceptionAddresses.locality,
    reception_address3_f89: o.offenderReceptionAddresses.cityCode,
    reception_address4_f90: o.offenderReceptionAddresses.countyCode,
    reception_address5_f91: o.offenderReceptionAddresses.countryCode,
    reception_address6_f92: o.offenderReceptionAddresses.postalCode,
    reception_address7_f93: o.offenderReceptionAddresses.phoneNo,

    home_address1_f94: formatAddressLine1(o.offenderHomeAddresses),
    home_address2_f95: o.offenderHomeAddresses.locality,
    home_address3_f96: o.offenderHomeAddresses.cityCode,
    home_address4_f97: o.offenderHomeAddresses.countyCode,
    home_address5_f98: o.offenderHomeAddresses.countryCode,
    home_address6_f99: o.offenderHomeAddresses.postalCode,
    home_address7_f100: o.offenderHomeAddresses.phoneNo,

    nok_name_f101: formatContactPersonName(o.nextOfKin),
    nok_nfa_f102: formatContactPersonRelationship(o.nextOfKin),
    nok_address1_f103: (o.nextOfKin && formatAddressLine1(getFirst(withList(o.nextOfKin.addresses)))),
    nok_address2_f104: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).locality),
    nok_address3_f105: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).cityCode),
    nok_address4_f106: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).countyCode),
    nok_address5_f107: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).countryCode),
    nok_address6_f108: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).postalCode),
    nok_address7_f109: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).phoneNo),

    prob_name_f110: formatContactPersonName(o.offenderManager),
    prob_address1_f111: (o.offenderManager && formatAddressLine1(getFirst(withList(o.offenderManager.addresses)))),
    prob_address2_f112: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).locality),
    prob_address3_f113: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).cityCode),
    prob_address4_f114: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).countyCode),
    prob_address5_f115: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).countryCode),
    prob_address6_f116: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).postalCode),
    prob_address7_f117: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).phoneNo),

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
    movement_date_f136: moment(o.lastOffenderMovement.movementDate),
    movement_hour_f137: moment(o.lastOffenderMovement.movementTime).format('HH'),
    movement_min_f138: moment(o.lastOffenderMovement.movementTime).format('mm'),
    movement_sec_f139: moment(o.lastOffenderMovement.movementTime).format('ss'),
    movement_code_f140: o.lastOffenderMovement.movementReasonCode,
    court_f141: o.offenderCourtEscort.toAgencyLocationId,
    escort_f142: o.offenderCourtEscort.escortCode,
    first_out_mov_post_adm_f143: moment(o.firstOffenderOutMovement.movementDate),
// 144	Employed
    diary_details_f145: withList(o.diaryDetails).map(odd => formatOffenderDiaryDetail(odd, o)),
    licence_type_f146: formatLicenseType(o.offenderLicense),
    other_offences_f147: [...otherOffences(o).reduce((x, c) => x.add(c.offenceCode), new Set())],
    active_alerts_f148: o.activeAlerts.map(formatAlert),
    court_type_f149: o.courtOutcome.outcomeReasonCode,
    court_code_f150: o.mostRecentConviction.agyLocId,
    court_name_f151: "",
// 152	Activity Details
//     152a	Activity Description
//     152b	Activity Location
//     152c	Activity Start Hour
//     152d	Activity Start Min
//     152e	Activity End Hour
//     152f	Activity End Min
    tused_f153: moment(o.offenderSentenceCalculationDates.tused),
  };

  return model;
};
