const moment = require('moment');
const helpers = require('../helpers');

const getFirst = a => a[0] || {};
const getLast = a => a[a.length - 1] || {};
const withList = a => a || [];

const getOffenderTransfers = o =>
  withList(o.movements)
    .filter(oem => (
      oem.offenderBookingId === o.mainBooking.offenderBookingId &&
      oem.movementTypeCode === 'TRN'
    ));

const getOffenderEmployments = o =>
  withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.offenderBookingId &&
      oe.employmentDate &&
      !oe.terminationDate
    ));

const getCharges = o =>
  withList(o.charges)
    .filter(oc => (
      oc.bookingId === o.mainBooking.offenderBookingId
    ));

const getContactPersons = o =>
  withList(o.contactPersons)
    .filter(ocp => (
      ocp.bookingId === o.mainBooking.offenderBookingId &&
      ocp.active &&
      !getFirst(withList(ocp.addresses)).endDate
    ));

const getReleaseDetails = o =>
  withList(o.releaseDetails)
    .filter(ord => (
      ord.bookingId === o.mainBooking.offenderBookingId
    ));

const getOffenderSentenceCalculations = o =>
  withList(o.sentenceCalculations)
    .filter(s => (
      s.bookingId === o.mainBooking.offenderBookingId
    ))
    .reduce((a, b) => (
      !a.effectiveSentenceEndDate ||
      moment(b.effectiveSentenceEndDate).diff(a.effectiveSentenceEndDate) > 0 ? b : a
    ), moment(0)) || {};

const getOffenderSentences = o =>
  withList(o.sentences)
    .filter(s => (
      s.bookingId === o.mainBooking.offenderBookingId &&
      s.isActive
    ));

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
      hp.bookingId === o.mainBooking.offenderBookingId &&
      hp.problemType === 'MATSTAT' &&
      hp.problemStatus === 'ON' &&
    //hp.domain === 'HEALTH_PBLM' &&
      (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
    )));

const getOffenderSecurityCategory = o =>
  getFirst(withList(o.assessments)
    .filter(oa => (
      oa.offenderBookingId === o.mainBooking.offenderBookingId &&
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
  /*
  `"${[
    moment(odd.movementDateTime).format('DD/MM/YYYY'),
    moment(odd.movementDateTime).format('HH:mm:ss'),
    odd.movementReasonCode || "",
    odd.comments || "",
    odd.escortType || "",
  ].join('","')}"`;
  */
  [
    moment(odd.movementDateTime).format('DD/MM/YYYY'),
    moment(odd.movementDateTime).format('HH:mm:ss'),
    odd.movementReasonCode || "",
    odd.comments || "",
    odd.escortType || "",
    formatAlert(o.notForRelease),
  ];

const getCustodyStatus = o => {
  let ob = o.mainBooking;

  let status = [];
  if (ob.activeFlag || (!ob.activeFlag && ~['ESCP', 'UAL', 'UAL_ECL'].indexOf(ob.statusReason.substring(5))) || ob.inOutStatus === 'TRN') {
    status.push('Active');
  } else if (!ob.activeFlag && ob.bookingSequence === 1) {
    status.push('INACTIVE');
  } else if (!ob.activeFlag && ob.bookingSequence > 1) {
    status.push('HISTORIC');
  }

  if (~['ESCP', 'UAL'].indexOf(ob.statusReason.substring(5))) {
    status.push('UAL');
  } else if (~['UAL_ECL'].indexOf(ob.statusReason.substring(5))) {
    status.push('UAL_ECL');
  } else if (ob.inOutStatus === 'TRN') {
    status.push('In Transit');
  } else {
    status.push(ob.inOutStatus.toUpperCase());
  }

  return status.join('-');
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
      op.bookingId === o.mainBooking.offenderBookingId
    )));

  return {
    profileDetails: withList(physicals.profileDetails)
        .reduce((x, opd) => {
          x[opd.profileType] = opd.profileCode;
          return x;
        }, {}),
    identifyingMarks: (x => {
      x.BODY = [...x.BODY];
      x.HEAD = [...x.HEAD];
      return x;
    })(withList(physicals.identifyingMarks)
        .reduce((x, oim) => {
          let area = (~[ 'EAR', 'FACE', 'HEAD', 'LIP', 'NECK', 'NOSE' ].indexOf(oim.bodyPartCode)) ? 'HEAD' : 'BODY';
          // area = (~[ 'ANKLE', 'ARM', 'ELBOW', 'FINGER', 'FOOT', 'HAND', 'KNEE', 'LEG', 'SHOULDER', 'THIGH', 'TOE', 'TORSO' ].indexOf(oim.bodyPartCode)) ? 'BODY' : 'HEAD';

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
      op.bookingId === o.mainBooking.offenderBookingId
    ))
    .map(iep => iep.iepLevel));

const getEmployment = o =>
  getFirst(withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.offenderBookingId &&
      (oe.terminationDate || moment(oe.terminationDate).diff(o.mainBooking.startDate) > 0)
    )));

const getImprisonmentStatus = o =>
  getFirst(withList(o.imprisonmentStatuses)
    .filter(op => (
      op.offenderBookId === o.mainBooking.offenderBookingId
    )));

const isSexOffender = o =>
  withList(o.charges)
    .filter(oc => ~withList(oc.offenceIndicatorCodes).indexOf('S')).length > 0;

const getDateOfFirstConviction = o =>
  withList(o.courtEvents)
    //.filter(ce => os.sentence_status = 'A')

module.exports.build = (data) => {
  let o = [
    ['sysdate', () => moment()],
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
    ['dateOfFirstConviction', getDateOfFirstConviction]
  ].reduce((x, p) => { x[p[0]] = p[1](x); return x; }, Object.assign({}, data));

  let model = {
    sysdate_f1: o.sysdate.format('DD/MM/YYYY'),                                         // 1	System Date
    establishment_f2: "",                                                                     // 2	Establishment
    estab_code_f3: o.mainBooking.agencyLocationId,                                                  // 3	Prison Code
    nomis_id_f4: o.nomsId,                                                               // 4	NOMS Number
    gender_f5: o.sexCode,                                                              // 5	Gender Description
    prison_no_f6: o.mainBooking.bookingNo,                                                         // 6	Booking Number
    surname_f7: o.surname,                                                              // 7	Last Name
    forename1_f8: o.firstName,                                                            // 8	Given Name 1
    forename2_f9: o.middleNames,                                                          // 9	Given Name 2
    cro_f10: o.offenderIdentifiers.CRO,                                             // 10	CRO Number
    adult_yp_f11: o.physicals.profileDetails.YOUTH,                                      // 11	Adult or YP
    age_f12: getAge(o),                                                             // 12	Age
    dob_f13: moment(o.dateOfBirth).format('DD/MM/YYYY'),                            // 13	DOB
    nationality_f14: o.physicals.profileDetails.NAT,                                        // 14	Nationality Description
    ethnicity_f15: o.raceCode,                                                            // 15	Ethnicity Description
    religion_f16: o.physicals.profileDetails.RELF,                                       // 16	Religion Description
    marital_f17: o.physicals.profileDetails.MARITAL,                                    // 17	Marital Status Description
    maternity_status_f18: getMaternityStatus(o, o.sysdate).problemCode,                          // 18	Maternity Status Description
    location_f19: o.mainBooking.livingUnitId,                                                     // 19	Cell Location
    incentive_band_f20: o.IEPLevel.iepLevel,                                                   // 20	Incentive Level Description
    occupation_v21: o.employments.occupationsCode,                                         // 21	Occupation Description
    transfer_reason_f22: formatTransferReasonCode(o.firstOffenderTransfer),                                      // 22	Transfer Reason
    first_reception_date_f23: moment(o.mainBooking.startDate).format('DD/MM/YYYY'),                           // 23	First Reception Date
    custody_status_f24: getCustodyStatus(o),                                                   // 24	Custody Status
    inmate_status_f25: o.imprisonmentStatus.imprisonmentStatus,                               // 25	Main Legal Status Description
    sec_cat_f26: o.offenderSecurityCategory.reviewSupLevelType,                                           // 26	Security Category Description
    sec_cat_next_review_f27: (o.offenderSecurityCategory.nextReviewDate && moment(o.offenderSecurityCategory.nextReviewDate).format('DD/MM/YYYY')),// 27	Security Category Review Date
    sentence_years_f28: (o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[0],               // 28	Sentence Length (Years)
    sentence_months_f29: (o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[1],               // 29	Sentence Length (Months)
    sentence_days_f30: (o.offenderSentenceCalculations.effectiveSentenceLength || '').split(/\//gmi)[2],               // 30	Sentence Length (Days)
    previous_prison_no_f31: o.previousBookingNos,                                                  // 31	Previous Booking Number
    earliest_release_date_f32: earliestReleaseDate(o).format('DD/MM/YYYY'),                           // 32	Earliest Release Date
    check_hold_governor_f33: o.checkHoldAlerts.T_TG,                                                // 33	Check Hold Governor
    // 34	Check Hold General (to be left blank)
    // 35	Check Hold Discipline (to be left blank)
    check_hold_allocation_36: o.checkHoldAlerts.T_TAH,                                               // 36	Check Hold Allocation
    check_hold_security_37: o.checkHoldAlerts.T_TSE,                                               // 37	Check Hold Security
    check_hold_medical_38: o.checkHoldAlerts.T_TM,                                                // 38	Check Hold Medical
    check_hold_parole_39: o.checkHoldAlerts.T_TPR,                                               // 39	Check Hold Parole
    date_of_first_conviction_40: "",// 40	Date Of First Conviction
    date_first_sentenced_f41: moment(o.offenderSentence.startDate).format('DD/MM/YYYY'),                           // 41	Date First Sentenced
    f2052_status_42: o.checkHoldAlerts.H_HA,                                                // 42	ACCT Status (F2052)
    highest_ranked_offence_f43: highestRankedOffence(o).offenceCode,                                   // 43	Highest Ranked Offence
    // 44	Status Rank (to be left blank)
    pending_transfers_f45: o.pendingOffenderTransfer.toAgencyLocationId,                                  // 45	Pending Transfers (Full Establishment Name)
    received_from_f46: o.pendingOffenderTransfer.fromAgencyLocationId,                                // 46	Received From
    vulnerable_prisoner_alert_f47: o.checkHoldAlerts.VUL,                                                 // 47	Vulnerable Prisoner Alert
    pnc_f48: o.offenderIdentifiers.PNC,                                             // 48	PNC Number
    emplmnt_status_discharge_f49: dischargeEmployment(o).employmentPostCode,                             // 49	Employment Status at Discharge
    emplmnt_status_reception_f50: receptionEmployment(o).employmentPostCode,                             // 50	Employment Status at Reception
    schedule_1_sex_offender_f51: formatAlert(o.MAPPA),                                                  // 51	MAPPA Levels (Schedule 1 Sex Offender)
    sex_offender_f52: o.isSexOffender ? 'Y' : 'N',                                           // 52	Sex Offender
// 53	Supervising Service
    height_metres_f54: o.physicals.physicalAttributes.heightCM / 100,                         // 54	Height (metres)
    complexion_f55: o.physicals.profileDetails.COMPL,                                      // 55	Complexion
    hair_56: o.physicals.profileDetails.HAIR,                                       // 56	Hair Colour
    left_eye_57: o.physicals.profileDetails.L_EYE_C,                                    // 57	Left Eye
    right_eye_58: o.physicals.profileDetails.R_EYE_C,                                    // 58	Right Eye
    build_59: o.physicals.profileDetails.BUILD,                                      // 59	Build
    face_60: o.physicals.profileDetails.FACE,                                       // 60	Facial Shape
    facial_hair_61: o.physicals.profileDetails.FACIAL_HAIR,                                // 61	Facial Hair
    marks_head_f62: o.physicals.identifyingMarks.HEAD,                                     // 62	Physical Mark  Head
    marks_body_f63: o.physicals.identifyingMarks.BODY,                                     // 63	Physical Mark Body
    sentence_length_f64: moment(o.offenderSentenceCalculations.effectiveSentenceEndDate).diff(moment(o.offenderSentence.startDate), 'years'),// 64	Effective Sentence Length
    release_date_f65: moment(o.releaseDetails.releaseDate).format('DD/MM/YYYY'),             // 65	Confirmed Release Date
    release_name_f66: formatReleaseReason(o.releaseDetails),                                 // 66	Release Reason
    sed_f67: o.offenderSentenceCalculationDates.sed,                                                             // 67	SED
    hdced_f68: o.offenderSentenceCalculationDates.hdced,                                                           // 68	HDCED
    hdcad_f69: o.offenderSentenceCalculationDates.hdcad,                                                           // 69	HDCAD
    ped_f70: o.offenderSentenceCalculationDates.ped,                                                             // 70	PED
    crd_f71: o.offenderSentenceCalculationDates.crd,                                                             // 71	CRD
    npd_f72: o.offenderSentenceCalculationDates.npd,                                                             // 72	NPD
    led_f73: o.offenderSentenceCalculationDates.led,                                                             // 73	LED
    date_sec_cat_changed_f74: o.offenderSecurityCategory.evaluationDate && moment(o.offenderSecurityCategory.evaluationDate).format('DD/MM/YYYY'),// 74	Date Security Category Changed
    rule_45_yoi_rule_46_f75: o.checkHoldAlerts.V_45_46,                                             // 75	Rule 45/YOI Rule 49
    f2052sh_f76: o.checkHoldAlerts.SH_STS,                                              // 76	ACCT (Self Harm) Status
    f2052_start_f77: o.checkHoldAlerts.SH_Date,                                             // 77  ACCT (Self Harm) Start Date

    discharge_nfa_f78: getNFA(o.offenderDischargeAddresses),                                               // 78	Discharge Address Relationship
    discharge_address1_f79: formatAddressLine1(o.offenderDischargeAddresses),                                   // 79	Discharge Address Line 1
    discharge_address2_f80: o.offenderDischargeAddresses.locality,                                              // 80	Discharge Address Line 2
    discharge_address3_f81: o.offenderDischargeAddresses.cityCode,                                              // 81	Discharge Address Line 3
    discharge_address4_f82: o.offenderDischargeAddresses.countyCode,                                            // 82	Discharge Address Line 4
    discharge_address5_f83: o.offenderDischargeAddresses.countryCode,                                           // 83	Discharge Address Line 5
    discharge_address6_f84: o.offenderDischargeAddresses.postalCode,                                            // 84	Discharge Address Line 6
    discharge_address7_f85: o.offenderDischargeAddresses.phoneNo,                                               // 85	Discharge Address Line 7

    reception_nfa_f86: getNFA(o.offenderReceptionAddresses),                                                   // 86	Reception Address Relationship
    reception_address1_f87: formatAddressLine1(o.offenderReceptionAddresses),                                       // 87	Reception Address Line 1
    reception_address2_f88: o.offenderReceptionAddresses.locality,                                                  // 88	Reception Address Line 2
    reception_address3_f89: o.offenderReceptionAddresses.cityCode,                                                  // 89	Reception Address Line 3
    reception_address4_f90: o.offenderReceptionAddresses.countyCode,                                                // 90	Reception Address Line 4
    reception_address5_f91: o.offenderReceptionAddresses.countryCode,                                               // 91	Reception Address Line 5
    reception_address6_f92: o.offenderReceptionAddresses.postalCode,                                                // 92	Reception Address Line 6
    reception_address7_f93: o.offenderReceptionAddresses.phoneNo,                                                   // 93	Reception Address Line 7

    home_address1_f94: formatAddressLine1(o.offenderHomeAddresses),                                        // 94	Home Address Line 1
    home_address2_f95: o.offenderHomeAddresses.locality,                                                   // 95	Home Address Line 2
    home_address3_f96: o.offenderHomeAddresses.cityCode,                                                   // 96	Home Address Line 3
    home_address4_f97: o.offenderHomeAddresses.countyCode,                                                 // 97	Home Address Line 4
    home_address5_f98: o.offenderHomeAddresses.countryCode,                                                // 98	Home Address Line 5
    home_address6_f99: o.offenderHomeAddresses.postalCode,                                                 // 99	Home Address Line 6
    home_address7_f100: o.offenderHomeAddresses.phoneNo,                                                   // 100	Home Address Line 7

    nok_name_f101: formatContactPersonName(o.nextOfKin),
    nok_nfa_f102: formatContactPersonRelationship(o.nextOfKin),                         // 102	NOK Address Relationship
    nok_address1_f103: (o.nextOfKin && formatAddressLine1(getFirst(withList(o.nextOfKin.addresses)))),             // 103	NOK Address Line 1
    nok_address2_f104: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).locality),                        // 104	NOK Address Line 2
    nok_address3_f105: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).cityCode),                        // 105	NOK Address Line 3
    nok_address4_f106: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).countyCode),                      // 106	NOK Address Line 4
    nok_address5_f107: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).countryCode),                     // 107	NOK Address Line 5
    nok_address6_f108: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).postalCode),                      // 108	NOK Address Line 6
    nok_address7_f109: (o.nextOfKin && getFirst(withList(o.nextOfKin.addresses)).phoneNo),                         // 109	NOK Address Line 7

    prob_name_f110: formatContactPersonName(o.offenderManager),
    prob_address1_f111: (o.offenderManager && formatAddressLine1(getFirst(withList(o.offenderManager.addresses)))),
    prob_address2_f112: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).locality),
    prob_address3_f113: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).cityCode),
    prob_address4_f114: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).countyCode),
    prob_address5_f115: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).countryCode),
    prob_address6_f116: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).postalCode),
    prob_address7_f117: (o.offenderManager && getFirst(withList(o.offenderManager.addresses)).phoneNo),

    f118: "",                                                                   // 118	Remark Type Allocation
    f119: "",                                                                   // 119	Remarks Allocation
    f120: "",                                                                   // 120	Remark Type Security
    f121: "",                                                                   // 121	Remarks Security
    f122: "",                                                                   // 122	Remark Type Medical
    f123: "",                                                                   // 123	Remarks Medical
    f124: "",                                                                   // 124	Remark Type Parole
    f125: "",                                                                   // 125	Remarks Parole
    f126: "",                                                                   // 126	Remark Type Discipline
    f127: "",                                                                   // 127	Remarks Discipline
    f128: "",                                                                   // 128	Remark Type General
    f129: "",                                                                   // 129	Remarks General
    f130: "",                                                                   // 130	Remark Type Reception
    f131: "",                                                                   // 131	Remarks Reception
    f132: "",                                                                   // 132	Remark Type Labour
    f133: "",                                                                   // 133	Remarks Labour

    sending_estab_f134: o.lastOffenderTransfer.fromAgencyLocationId,
    reason_f135: o.lastOffenderTransfer.movementReasonCode,
    movement_date_f136: moment(o.lastOffenderMovement.movementDate).format('DD/MM/YYYY'),
    movement_hour_f137: moment(o.lastOffenderMovement.movementTime).format('HH'),
    movement_min_f138: moment(o.lastOffenderMovement.movementTime).format('mm'),
    movement_sec_f139: moment(o.lastOffenderMovement.movementTime).format('ss'),
    movement_code_f140: o.lastOffenderMovement.movementReasonCode,
    court_f141: o.offenderCourtEscort.toAgencyLocationId,
    escort_f142: o.offenderCourtEscort.escortCode,
    first_out_mov_post_adm_f143: moment(o.firstOffenderOutMovement.movementDate).format('DD/MM/YYYY'),
// 144	Employed
    /*
    "Woodwork 2 AM","ALI-WIND-WWW2","08","15","11","45"~
    "Woodwork 2 AM","ALI-WIND-WWW2","08","15","11","45"~
    "Woodwork 2 PM","ALI-WIND-WWW2","13","15","16","15"~
    "Woodwork 2 PM","ALI-WIND-WWW2","13","15","16","15"
    */
    diary_details_f145: o.diaryDetails.map(odd => formatOffenderDiaryDetail(odd, o)),
    licence_type_f146: formatLicenseType(o.offenderLicense),
    other_offences_f147: [...otherOffences(o).reduce((x, c) => x.add(c.offenceCode), new Set())],
    active_alerts_f148: o.activeAlerts.map(formatAlert),
// 149	Court Outcome
// 150	Court Code
// 151	Court Name
// 152	Activity Details
//     152a	Activity Description
//     152b	Activity Location
//     152c	Activity Start Hour
//     152d	Activity Start Min
//     152e	Activity End Hour
//     152f	Activity End Min
    tused_f153: o.offenderSentenceCalculationDates.tused,                                                          // 153	Top Up Supervision Expiry Date
  };

  return model;
};
