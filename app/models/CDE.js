const moment = require('moment');
const helpers = require('../helpers');

const getFirst = a => a[0] || {};
const getLast = a => a[a.length - 1] || {};
const withList = a => a || [];

const pipe = p => ({
  apply(x) {
    return p.reduce((x, fn) => {
      x[fn[0]] = fn[1](x);
      return x;
    }, Object.assign({}, x));
  }
});

const optionalDate = d =>
  d ? moment(moment(d).format('YYYY-MM-DDT00:00:00.000Z')) : undefined;

const optionalTime = d =>
  d ? moment(d).format('HH:mm:ss') : undefined;

const optionalHeight = n =>
  n ? n / 100 : undefined;

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

const formatSupervisingService = om =>
  om && om.primaryAddress
    ? [
        formatAddressLine1(om.primaryAddress),
        om.primaryAddress.locality,
        om.primaryAddress.cityCode,
        om.primaryAddress.countyCode,
        om.primaryAddress.countryCode,
        om.primaryAddress.postalCode
      ]
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

const formatAdultOrYouth = x => {
  switch (x) {
    case 'Y': return 'YP';
    case 'N': return 'A';
    default: x;
  }
};

const formatOffenderDiaryDetail = (odd, o) =>
  ({
    date_145a: optionalDate(odd.movementDateTime),
    time_145b: optionalTime(odd.movementDateTime),
    reason_code_145c: odd.movementReasonCode || "",
    comment_text_145d: odd.comments || "",
    escort_type_145e: odd.escortType || "",
    not_for_release_alert_145f: formatAlert(o.notForRelease),
  });

const getMainBooking = o =>
  getFirst(withList(o.bookings));

const getPreviousBookings = o =>
  withList(o.bookings)
    .reduce((a, b) => {
      if (b.bookingNo !== o.mainBooking.bookingNo && !~a.indexOf(b.bookingNo)) {
        a.push(b.bookingNo);
      }
      return a;
    }, []);

const getMainAlias = o =>
  withList(o.aliases)
    .reduce((x, oa) => (oa.offenderId === o.mainBooking.offenderId ? oa : x), {
      nomsId: o.nomsId,
      firstName: o.firstName,
      middleNames: o.middleNames,
      surname: o.surname,
      dateOfBirth: o.dateOfBirth,
      sexCode: o.sexCode,
      raceCode: o.raceCode,
      offenderId: o.offenderId,
    }) || {};

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

const getMaternityStatus = (o, sysdate) =>
  getFirst(withList(o.healthProblems)
    .filter(hp => (
      hp.bookingId === o.mainBooking.bookingId &&
      hp.problemType === 'MATSTAT' &&
      hp.problemStatus === 'ON' &&
    //hp.domain === 'HEALTH_PBLM' &&
      (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
    )));

const getReleaseDetails = o =>
  withList(o.releaseDetails)
    .filter(ord => (
      ord.bookingId === o.mainBooking.bookingId
    ));

const getOffenderSentences = o =>
  withList(o.sentences)
    .filter(s => (
      s.bookingId === o.mainBooking.bookingId
    ));

const getOffenderSentenceCalculations = o =>
  withList(o.sentenceCalculations)
    .filter(s => (
      s.bookingId === o.mainBooking.bookingId
    ))
    .reduce((a, b) => (
      !a.effectiveSentenceEndDate ||
      moment(b.effectiveSentenceEndDate).diff(a.effectiveSentenceEndDate) > 0 ? b : a
    ), {}) || {};

const getOffenderSecurityCategory = o =>
  getFirst(withList(o.assessments)
    .filter(oa => (
      oa.bookingId === o.mainBooking.bookingId &&
      oa.evaluationResultCode === 'APP' &&
      oa.assessStatus === 'A' &&
      oa.assessmentType &&
      oa.assessmentType.assessmentClass === 'TYPE' &&
      oa.assessmentType.assessmentCode === 'CATEGORY' &&
      oa.assessmentType.determineSupLevelFlag
    )));

const getIEPLevel = o =>
  getFirst(withList(o.ieps)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    ))
    .map(iep => iep.iepLevel)) || { iepLevel: 'STD' };

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
    ))
  ) || { imprisonmentStatusCode: 'Unknown Sentenced'};

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

          (x[area] = x[area] || new Set()).add(oim);

          return x;
        }, {})),
    physicalAttributes: withList(physicals.physicalAttributes)
        .reduce((x, opa) => (x || opa), false),
  };
};

const getCourtOutcome = o =>
  getFirst(withList(o.courtEvents)
    .filter(ce =>
      ce.bookingId === o.mainBooking.bookingId &&
      ce.directionCode === 'OUT'
    ));

// main booking entire

const getOffenderSentence = o =>
  withList(o.offenderSentences)
    .reduce((a, b) => (
      !a.startDate || moment(b.startDate).diff(a.startDate) < 0 ? b : a
    ), {}) || {};

const getOffenderLicense = o =>
  getFirst(withList(o.offenderSentences)
    .filter(s => (
      s.sentenceCategory === 'LICENCE'
    )));

const getOffenderSentenceLength = o =>
  moment(o.offenderSentenceCalculations.effectiveSentenceEndDate)
    .diff(moment(o.offenderSentence.startDate), 'days') + 1;

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

const getFirstOffenderTransfer = o =>
  getLast(o.offenderTransfers);

const getLastOffenderTransfer = o =>
  getFirst(o.offenderTransfers
    .filter(m => m.active)); // TODO: movement date before extract date?

const getPendingOffenderTransfer = o =>
  getLast(o.offenderTransfers
    .filter(m => m.active)); // TODO: movement date after extract date?

const getLastOffenderMovement = o =>
  getFirst(withList(o.movements));

const getFirstOffenderOutMovement = o =>
  getLast(withList(o.movements)
    .filter(m => (
      m.movementDirection === 'OUT'
    )));

const getOffenderCourtEscort = o =>
  getFirst(withList(o.movements)
    .filter(m => (
      m.movementTypeCode === 'CRT' &&
      m.movementDirection === 'OUT'
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
    ))
    .map(ocp => {
      ocp.primaryAddress = getFirst(withList(ocp.addresses)) || {};

      return ocp;
    }));

const getOffenderManager = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.contactPersonType.contactType === 'O' &&
      ocp.contactPersonType.relationshipType === 'PROB'
    ))
    .map(ocp => {
      ocp.primaryAddress = getFirst(withList(ocp.addresses)) || {};

      return ocp;
    }));

const getCustodyStatus = data => {
  let mainBooking = data.mainBooking;

  let stat = {
    statusReason: (mainBooking.statusReason || "").substring(5),
    inTransit: (mainBooking.inOutStatus || "").toUpperCase() === 'TRN',
    isActive: (mainBooking.activeFlag || false),
    bookingSequence: mainBooking.bookingSequence,
  };

  if (stat.isActive) {
    return 'Active-In';
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

const getOffenderSentenceCalculationDates = o =>
  (osc => ({
    sed: optionalDate(osc.sedOverridedDate || osc.sedCalculatedDate),
    hdced: optionalDate(osc.hdcedOverridedDate || osc.hdcedCalculatedDate),
    hdcad: optionalDate(osc.hdcadOverridedDate || osc.hdcadCalculatedDate),
    etd: optionalDate(osc.etdOverridedDate || osc.etdCalculatedDate),
    mtd: optionalDate(osc.mtdOverridedDate || osc.mtdCalculatedDate),
    ltd: optionalDate(osc.ltdOverridedDate || osc.ltdCalculatedDate),
    crd: optionalDate(osc.crdOverridedDate || osc.crdCalculatedDate),
    ped: optionalDate(osc.pedOverridedDate || osc.pedCalculatedDate),
    apd: optionalDate(osc.apdOverridedDate || osc.apdCalculatedDate),
    npd: optionalDate(osc.npdOverridedDate || osc.npdCalculatedDate),
    ard: optionalDate(osc.ardOverridedDate || osc.ardCalculatedDate),
    led: optionalDate(osc.ledOverridedDate || osc.ledCalculatedDate),
    tused: optionalDate(osc.tusedOverridedDate || osc.tusedCalculatedDate)
  }))(o.offenderSentenceCalculations);

const earliestReleaseDate =  o =>
  (scd => [
    moment('2999-12-31'),
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

const isSexOffender = o =>
  withList(o.charges)
    .filter(oc => ~withList(oc.offenceIndicatorCodes).indexOf('S')).length > 0;

const getFirstConviction = o =>
  getLast(withList(o.courtEvents));

const getMostRecentConviction = o =>
  getFirst(withList(o.courtEvents)
    .filter(ce => (
      ce.bookingId === o.mainBooking.bookingId
    )));

const getFirstSentence = o =>
  getFirst(withList(getFirst(withList(
    getLast(withList(o.courtEvents)
      .filter(ce => withList(getFirst(withList(ce.courtEventCharges)).sentences).length > 0))
        .courtEventCharges)).sentences)
          .filter(s => s.isActive));

const model = pipe([
  ['mainBooking', getMainBooking],
  ['mainAlias', getMainAlias],
  ['previousBookingNos', getPreviousBookings],
  ['offenderIdentifiers', mapOffenderIdentifiers],
  ['offenderSecurityCategory', getOffenderSecurityCategory],
  ['offenderSentenceCalculations', getOffenderSentenceCalculations],
  ['offenderSentences', getOffenderSentences],
  ['offenderSentence', getOffenderSentence],
  ['offenderSentenceLength', getOffenderSentenceLength],
  ['offenderLicense', getOffenderLicense],
  ['offenderTransfers', getOffenderTransfers],
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
  ['offenderHomeAddress', getOffenderHomeAddress],
  ['offenderReceptionAddress', getOffenderReceptionAddress],
  ['offenderDischargeAddress', getOffenderDischargeAddress],
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
    adult_yp_f11: formatAdultOrYouth(o.physicals.profileDetails.YOUTH),
    age_f12: getAge(o.mainAlias),
    dob_f13: optionalDate(o.mainAlias.dateOfBirth),
    nationality_f14: o.physicals.profileDetails.NAT,
    ethnicity_f15: o.mainAlias.raceCode,
    religion_f16: o.physicals.profileDetails.RELF,
    marital_f17: o.physicals.profileDetails.MARITAL,
    maternity_status_f18: getMaternityStatus(o, o.sysdate).problemCode,
    location_f19: o.mainBooking.livingUnitId,
    incentive_band_f20: o.IEPLevel.iepLevel,
    occupation_v21: o.employments.occupationsCode,
    transfer_reason_f22: formatTransferReasonCode(o.firstOffenderTransfer),
    first_reception_date_f23: optionalDate(o.mainBooking.startDate),
    custody_status_f24: getCustodyStatus(o),
    inmate_status_f25: o.imprisonmentStatus.imprisonmentStatusCode,

    sec_cat: {
      level_f26: o.offenderSecurityCategory.reviewSupLevelType,
      next_review_f27: optionalDate(o.offenderSecurityCategory.nextReviewDate),
    },

    sentence: {
      years_f28: parseInt((o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[0] || 0, 10),
      months_f29: parseInt((o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[1] || 0, 10),
      days_f30: parseInt((o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[2] || 0, 10),
    },

    previous_prison_no_f31: o.previousBookingNos,
    earliest_release_date_f32: earliestReleaseDate(o),

    check_hold: {
      governor_f33: o.checkHoldAlerts.T_TG,
      // 34	Check Hold General (to be left blank)
      // 35	Check Hold Discipline (to be left blank)
      allocation_36: o.checkHoldAlerts.T_TAH,
      security_37: o.checkHoldAlerts.T_TSE,
      medical_38: o.checkHoldAlerts.T_TM,
      parole_39: o.checkHoldAlerts.T_TPR,
    },

    date_of_first_conviction_40: optionalDate(o.firstConviction.startDateTime),
    date_first_sentenced_f41: optionalDate(o.firstSentence.startDate),
    f2052_status_42: o.checkHoldAlerts.H_HA,
    highest_ranked_offence_f43: highestRankedOffence(o).offenceCode,
    // 44	Status Rank (to be left blank)
    pending_transfers_f45: o.pendingOffenderTransfer.toAgencyLocationId,
    received_from_f46: o.pendingOffenderTransfer.fromAgencyLocationId,
    vulnerable_prisoner_alert_f47: o.checkHoldAlerts.VUL,
    pnc_f48: o.offenderIdentifiers.PNC,

    emplmnt_status: {
      discharge_f49: dischargeEmployment(o).employmentPostCode,
      reception_f50: receptionEmployment(o).employmentPostCode,
    },

    schedule_1_sex_offender_f51: formatAlert(o.MAPPA),
    sex_offender_f52: (o.isSexOffender ? 'Y' : 'N'),
    supervising_service_f53: formatSupervisingService(o.offenderManager),
    height_metres_f54: optionalHeight(o.physicals.physicalAttributes.heightCM),
    complexion_f55: o.physicals.profileDetails.COMPL,
    hair_f56: o.physicals.profileDetails.HAIR,
    left_eye_f57: o.physicals.profileDetails.L_EYE_C,
    right_eye_f58: o.physicals.profileDetails.R_EYE_C,
    build_f59: o.physicals.profileDetails.BUILD,
    face_f60: o.physicals.profileDetails.FACE,
    facial_hair_f61: o.physicals.profileDetails.FACIAL_HAIR,

    marks: {
      head_f62: o.physicals.identifyingMarks.HEAD.map(formatIdentifyingMark),
      body_f63: o.physicals.identifyingMarks.BODY.map(formatIdentifyingMark),
    },

    sentence_length_f64: o.offenderSentenceLength,

    release: {
      date_f65: optionalDate(o.releaseDetails.releaseDate),
      name_f66: formatReleaseReason(o.releaseDetails),
    },

    sed_f67: o.offenderSentenceCalculationDates.sed,
    hdced_f68: o.offenderSentenceCalculationDates.hdced,
    hdcad_f69: o.offenderSentenceCalculationDates.hdcad,
    ped_f70: o.offenderSentenceCalculationDates.ped,
    crd_f71: o.offenderSentenceCalculationDates.crd,
    npd_f72: o.offenderSentenceCalculationDates.npd,
    led_f73: o.offenderSentenceCalculationDates.led,
    date_sec_cat_changed_f74: optionalDate(o.offenderSecurityCategory.evaluationDate),
    rule_45_yoi_rule_46_f75: o.checkHoldAlerts.V_45_46,

    f2052sh: {
      alert_f76: o.checkHoldAlerts.SH_STS,
      start_f77: o.checkHoldAlerts.SH_Date,
    },

    discharge: {
      nfa_f78: getNFA(o.offenderDischargeAddress),
      address1_f79: formatAddressLine1(o.offenderDischargeAddress),
      address2_f80: o.offenderDischargeAddress.locality,
      address3_f81: o.offenderDischargeAddress.cityCode,
      address4_f82: o.offenderDischargeAddress.countyCode,
      address5_f83: o.offenderDischargeAddress.countryCode,
      address6_f84: o.offenderDischargeAddress.postalCode,
      address7_f85: o.offenderDischargeAddress.phoneNo,
    },

    reception:{
      nfa_f86: getNFA(o.offenderReceptionAddress),
      address1_f87: formatAddressLine1(o.offenderReceptionAddress),
      address2_f88: o.offenderReceptionAddress.locality,
      address3_f89: o.offenderReceptionAddress.cityCode,
      address4_f90: o.offenderReceptionAddress.countyCode,
      address5_f91: o.offenderReceptionAddress.countryCode,
      address6_f92: o.offenderReceptionAddress.postalCode,
      address7_f93: o.offenderReceptionAddress.phoneNo,
    },

    home: {
      address1_f94: formatAddressLine1(o.offenderHomeAddress),
      address2_f95: o.offenderHomeAddress.locality,
      address3_f96: o.offenderHomeAddress.cityCode,
      address4_f97: o.offenderHomeAddress.countyCode,
      address5_f98: o.offenderHomeAddress.countryCode,
      address6_f99: o.offenderHomeAddress.postalCode,
      address7_f100: o.offenderHomeAddress.phoneNo,
    },

    nok: {
      name_f101: formatContactPersonName(o.nextOfKin),
      nfa_f102: formatContactPersonRelationship(o.nextOfKin),
      address1_f103: (o.nextOfKin && o.nextOfKin.primaryAddress && formatAddressLine1(o.nextOfKin.primaryAddress)),
      address2_f104: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.locality),
      address3_f105: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.cityCode),
      address4_f106: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.countyCode),
      address5_f107: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.countryCode),
      address6_f108: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.postalCode),
      address7_f109: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.phoneNo),
    },

    prob: {
      name_f110: formatContactPersonName(o.offenderManager),
      address1_f111: (o.offenderManager && o.offenderManager.primaryAddress && formatAddressLine1(o.offenderManager.primaryAddress)),
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
      date_f136: optionalDate(o.lastOffenderMovement.movementDateTime),
      hour_f137: moment(o.lastOffenderMovement.movementDateTime).format('HH'),
      min_f138: moment(o.lastOffenderMovement.movementDateTime).format('mm'),
      sec_f139: moment(o.lastOffenderMovement.movementDateTime).format('ss'),
      code_f140: o.lastOffenderMovement.movementReasonCode,
    },

    court_f141: o.offenderCourtEscort.toAgencyLocationId,
    escort_f142: o.offenderCourtEscort.escortCode,
    first_out_mov_post_adm_f143: optionalDate(o.firstOffenderOutMovement.movementDateTime),
// 144	Employed
    diary_details_f145: withList(o.diaryDetails).map(odd => formatOffenderDiaryDetail(odd, o)),
    licence_type_f146: formatLicenseType(o.offenderLicense),
    other_offences_f147: otherOffences(o).map(x => x.offenceCode).sort(),
    active_alerts_f148: o.activeAlerts.map(formatAlert),

    court: {
      type_f149: o.courtOutcome.courtEventType,
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

    tused_f153: optionalDate(o.offenderSentenceCalculationDates.tused),
  };
};
