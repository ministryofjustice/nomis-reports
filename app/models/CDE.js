const moment = require('moment');
const helpers = require('../helpers');

const getFirst = a => a[0] || {};
const getLast = a => a[a.length - 1] || {};
const withList = a => a || [];

const getTransfers = o =>
  withList(o.movements)
    .filter(oem => (
      oem.offenderBookingId === o.ob.offenderBookingId &&
      oem.movementTypeCode === 'TRN'
    ));

const getEmployments = o =>
  withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.ob.offenderBookingId &&
      oe.employmentDate &&
      !oe.terminationDate
    ));

const getCharges = o =>
  withList(o.charges)
    .filter(oc => (
      oc.bookingId === o.ob.offenderBookingId
    ));

const getContactPersons = o =>
  withList(o.contactPersons)
    .filter(ocp => (
      ocp.bookingId === o.ob.offenderBookingId &&
      (ocp.address && !ocp.address.endDate) &&
      (ocp.person && ocp.person.active)
    ));

const getReleaseDetails = o =>
  withList(o.releaseDetails)
    .filter(ord => (
      ord.bookingId === o.ob.offenderBookingId
    ));

const getSentenceCalculations = o =>
  withList(o.sentenceCalculations)
    .filter(s => (
      s.bookingId === o.ob.offenderBookingId
    ))
    .reduce((a, b) => (
      !a.effectiveSentenceEndDate ||
      moment(b.effectiveSentenceEndDate).diff(a.effectiveSentenceEndDate) > 0 ? b : a
    ), moment(0)) || {};

const getSentence = o =>
  withList(o.sentences)
    .filter(s => (
      s.bookingId === o.ob.offenderBookingId &&
      s.sentenceStatus === 'A'
    ))
    .reduce((a, b) => (
      !a.startDate ||
      moment(b.startDate).diff(a.startDate) > 0 ? b : a
    ), moment(0)) || {};

const getOffenderAddresses = o =>
  withList(o.addresses)
    .filter(oa => (
      oa.ownerClass === 'OFF' &&
      !oa.endDate &&
      oa.active
    ));

const getIdentifiers = o =>
  withList(o.identifiers)
    .reduce((x, oi) => {
      x[oi.identifierType] = oi.identifier;
      return x;
    }, {});

const getLicense = o =>
  getFirst(withList(o.sentences)
    .filter(s => (
      s.bookingId === o.ob.offenderBookingId &&
      s.sentenceStatus === 'A' &&
      s.sentenceCategory === 'LICENSE'
    )));

const getMaternityStatus = (o, sysdate) =>
  getFirst(withList(o.healthProblems)
    .filter(hp => (
      hp.bookingId === o.ob.offenderBookingId &&
      hp.problemType === 'MATSTAT' &&
      hp.problemStatus === 'ON' &&
    //hp.domain === 'HEALTH_PBLM' &&
      (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
    )));

const getSecurityCategory = o =>
  getFirst(withList(o.assessments)
    .filter(oa => (
      oa.offenderBookingId === o.ob.offenderBookingId &&
      oa.evaluationResultCode === 'APP' &&
      oa.assessStatus === 'A' &&
      oa.assessmentType &&
      oa.assessmentType.assessmentClass === 'TYPE' &&
      oa.assessmentType.assessmentCode === 'CATEGORY' &&
      oa.assessmentType.determineSupLevelFlag === 'Y'
    )));

const lastMovement = o =>
  getFirst(o.movements);

const firstTransfer = o =>
  getLast(o.trn);

const lastTransfer = o =>
  getFirst(o.trn);

const pendingTransfer = o =>
  getLast(withList(o.trn)
    .filter(m => m.active));

const courtEscort = o =>
  getFirst(withList(o.trn)
    .filter(m => (
      m.movementType === 'CRT' &&
      m.directionCode === 'OUT'
    )));

const firstOutMovement = o =>
  getLast(withList(o.movements)
    .filter(m => (
      m.directionCode === 'OUT'
    )));

const receptionEmployment = o =>
  getLast(o.oe);

const dischargeEmployment = o =>
  getFirst(o.oe);

const highestRankedOffence = o =>
  getFirst(o.oc);

const otherOffences = o =>
  withList(o.oc)
    .filter((o, i) => i !== 0);

const getHomeAddress = o =>
  getFirst(withList(o.oa)
    .filter(a => (a.addressUsage === 'HOME')));

const getReceptionAddress = o =>
  getFirst(withList(o.oa)
    .filter(a => (a.addressUsage === 'RECEP')));

const getDischargeAddress = o =>
  getFirst(withList(o.oa)
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

const getCustodyStatus = o => {
  let ob = o.ob;

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
  ].sort((a, b) => a.diff(b))[0])(o.scd);

const sentenceCalculationDates = o =>
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
  }))(o.osc);

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
      op.bookingId === o.ob.offenderBookingId
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
      op.bookingId === o.ob.offenderBookingId
    ))
    .map(iep => iep.iepLevel));

const getEmployment = o =>
  getFirst(withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.ob.offenderBookingId &&
      (oe.terminationDate || moment(oe.terminationDate).diff(o.ob.startDate) > 0)
    )));

const getImprisonmentStatus = o =>
  getFirst(withList(o.imprisonmentStatuses)
    .filter(op => (
      op.offenderBookId === o.ob.offenderBookingId
    )));

const isSexOffender = o =>
  withList(o.charges)
    .filter(oc => ~withList(oc.offenceIndicatorCodes).indexOf('S')).length > 0;

module.exports.build = (data) => {
  let o = [
    ['sysdate', () => moment()],
    ['ob', getMainBooking],
    ['previousBookingNos', getPreviousBookings],
    ['offenderIdentifiers', getIdentifiers],
    ['secCat', getSecurityCategory],
    ['osc', getSentenceCalculations],
    ['os', getSentence],
    ['licence', getLicense],
    ['trn', getTransfers],
    ['ftrn', firstTransfer],
    ['ltrn', lastTransfer],
    ['lmove', lastMovement],
    ['firstOutMovement', firstOutMovement],
    ['pendingTransfer', pendingTransfer],
    ['courtEscort', courtEscort],
    ['scd', sentenceCalculationDates],
    ['oe', getEmployments],
    ['oc', getCharges],
    ['offenderContactPersons', getContactPersons],
    ['oa', getOffenderAddresses],
    ['homeAddr', getHomeAddress],
    ['recepAddr', getReceptionAddress],
    ['dischargeAddr', getDischargeAddress],
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
  ].reduce((x, p) => { x[p[0]] = p[1](x); return x; }, Object.assign({}, data));

  let model = {
    f1: o.sysdate.format('DD/MM/YYYY'),                                         // 1	System Date
    f2: "",                                                                     // 2	Establishment
    f3: o.ob.agencyLocationId,                                                  // 3	Prison Code
    f4: o.nomsId,                                                               // 4	NOMS Number
    f5: o.sexCode,                                                              // 5	Gender Description
    f6: o.ob.bookingNo,                                                         // 6	Booking Number
    f7: o.surname,                                                              // 7	Last Name
    f8: o.firstName,                                                            // 8	Given Name 1
    f9: o.middleNames,                                                          // 9	Given Name 2
    f10: o.offenderIdentifiers.CRO,                                             // 10	CRO Number
    f11: o.physicals.profileDetails.YOUTH,                                      // 11	Adult or YP
    f12: getAge(o),                                                             // 12	Age
    f13: moment(o.dateOfBirth).format('DD/MM/YYYY'),                            // 13	DOB
    f14: o.physicals.profileDetails.NAT,                                        // 14	Nationality Description
    f15: o.raceCode,                                                            // 15	Ethnicity Description
    f16: o.physicals.profileDetails.RELF,                                       // 16	Religion Description
    f17: o.physicals.profileDetails.MARITAL,                                    // 17	Marital Status Description
    f18: getMaternityStatus(o, o.sysdate).problemCode,                          // 18	Maternity Status Description
    f19: o.ob.livingUnitId,                                                     // 19	Cell Location
    f20: o.IEPLevel.iepLevel,                                                   // 20	Incentive Level Description
    f21: o.employments.occupationsCode,                                         // 21	Occupation Description
    f22: formatTransferReasonCode(o.ftrn),                                      // 22	Transfer Reason
    f23: moment(o.ob.startDate).format('DD/MM/YYYY'),                           // 23	First Reception Date
    f24: getCustodyStatus(o),                                                   // 24	Custody Status
    f25: o.imprisonmentStatus.imprisonmentStatus,                               // 25	Main Legal Status Description
    f26: o.secCat.reviewSupLevelType,                                           // 26	Security Category Description
    f27: (o.secCat.nextReviewDate && moment(o.secCat.nextReviewDate).format('DD/MM/YYYY')),// 27	Security Category Review Date
    f28: (o.osc.effectiveSentenceLength || '').split(/\//gmi)[0],               // 28	Sentence Length (Years)
    f29: (o.osc.effectiveSentenceLength || '').split(/\//gmi)[1],               // 29	Sentence Length (Months)
    f30: (o.osc.effectiveSentenceLength || '').split(/\//gmi)[2],               // 30	Sentence Length (Days)
    f31: o.previousBookingNos,                                                  // 31	Previous Booking Number
    f32: earliestReleaseDate(o).format('DD/MM/YYYY'),                           // 32	Earliest Release Date
    f33: o.checkHoldAlerts.T_TG,                                                // 33	Check Hold Governor
    f34: "",                                                                    // 34	Check Hold General (to be left blank)
    f34: "",                                                                    // 35	Check Hold Discipline (to be left blank)
    f36: o.checkHoldAlerts.T_TAH,                                               // 36	Check Hold Allocation
    f37: o.checkHoldAlerts.T_TSE,                                               // 37	Check Hold Security
    f38: o.checkHoldAlerts.T_TM,                                                // 38	Check Hold Medical
    f39: o.checkHoldAlerts.T_TPR,                                               // 39	Check Hold Parole
    // 40	Date Of First Conviction
    f41: moment(o.os.startDate).format('DD/MM/YYYY'),                           // 41	Date First Sentenced
    f42: o.checkHoldAlerts.H_HA,                                                // 42	ACCT Status (F2052)
    f43: highestRankedOffence(o).offenceCode,                                   // 43	Highest Ranked Offence
    f34: "",                                                                    // 44	Status Rank (to be left blank)
    f45: o.pendingTransfer.toAgencyLocationId,                                               // 45	Pending Transfers (Full Establishment Name)
    f46: o.pendingTransfer.fromAgencyLocationId,                                             // 46	Received From
    f47: o.checkHoldAlerts.VUL,                                                 // 47	Vulnerable Prisoner Alert
    f48: o.offenderIdentifiers.PNC,                                             // 48	PNC Number
    f49: dischargeEmployment(o).employmentPostCode,                             // 49	Employment Status at Discharge
    f50: receptionEmployment(o).employmentPostCode,                             // 50	Employment Status at Reception
    f51: formatAlert(o.MAPPA),                                                  // 51	MAPPA Levels (Schedule 1 Sex Offender)
    f52: o.isSexOffender ? 'Y' : 'N',                                           // 52	Sex Offender
    // 53	Supervising Service
    f54: o.physicals.physicalAttributes.heightCM / 100,                         // 54	Height (metres)
    f55: o.physicals.profileDetails.COMPL,                                      // 55	Complexion
    f56: o.physicals.profileDetails.HAIR,                                       // 56	Hair Colour
    f57: o.physicals.profileDetails.L_EYE_C,                                    // 57	Left Eye
    f58: o.physicals.profileDetails.R_EYE_C,                                    // 58	Right Eye
    f59: o.physicals.profileDetails.BUILD,                                      // 59	Build
    f60: o.physicals.profileDetails.FACE,                                       // 60	Facial Shape
    f61: o.physicals.profileDetails.FACIAL_HAIR,                                // 61	Facial Hair
    f62: o.physicals.identifyingMarks.HEAD,                                     // 62	Physical Mark  Head
    f63: o.physicals.identifyingMarks.BODY,                                     // 63	Physical Mark Body
    f64: moment(o.osc.effectiveSentenceEndDate).diff(moment(o.os.startDate), 'years'),// 64	Effective Sentence Length
    f55: moment(o.releaseDetails.releaseDate).format('DD/MM/YYYY'),             // 65	Confirmed Release Date
    f66: formatReleaseReason(o.releaseDetails),                                 // 66	Release Reason
    f67: o.scd.sed,                                                             // 67	SED
    f68: o.scd.hdced,                                                           // 68	HDCED
    f69: o.scd.hdcad,                                                           // 69	HDCAD
    f70: o.scd.ped,                                                             // 70	PED
    f71: o.scd.crd,                                                             // 71	CRD
    f72: o.scd.npd,                                                             // 72	NPD
    f73: o.scd.led,                                                             // 73	LED
    f74: o.secCat.evaluationDate && moment(o.secCat.evaluationDate).format('DD/MM/YYYY'),// 74	Date Security Category Changed
    f75: o.checkHoldAlerts.V_45_46,                                             // 75	Rule 45/YOI Rule 49
    f76: o.checkHoldAlerts.SH_STS,                                              // 76	ACCT (Self Harm) Status
    f77: o.checkHoldAlerts.SH_Date,                                             // 77  ACCT (Self Harm) Start Date

    f78: getNFA(o.dischargeAddr),                                               // 78	Discharge Address Relationship
    f79: formatAddressLine1(o.dischargeAddr),                                   // 79	Discharge Address Line 1
    f80: o.dischargeAddr.locality,                                              // 80	Discharge Address Line 2
    f81: o.dischargeAddr.cityCode,                                              // 81	Discharge Address Line 3
    f82: o.dischargeAddr.countyCode,                                            // 82	Discharge Address Line 4
    f83: o.dischargeAddr.countryCode,                                           // 83	Discharge Address Line 5
    f84: o.dischargeAddr.postalCode,                                            // 84	Discharge Address Line 6
    f85: o.dischargeAddr.phoneNo,                                               // 85	Discharge Address Line 7

    f86: getNFA(o.recepAddr),                                                   // 86	Reception Address Relationship
    f87: formatAddressLine1(o.recepAddr),                                       // 87	Reception Address Line 1
    f88: o.recepAddr.locality,                                                  // 88	Reception Address Line 2
    f89: o.recepAddr.cityCode,                                                  // 89	Reception Address Line 3
    f90: o.recepAddr.countyCode,                                                // 90	Reception Address Line 4
    f91: o.recepAddr.countryCode,                                               // 91	Reception Address Line 5
    f92: o.recepAddr.postalCode,                                                // 92	Reception Address Line 6
    f93: o.recepAddr.phoneNo,                                                   // 93	Reception Address Line 7

    f94: formatAddressLine1(o.homeAddr),                                        // 94	Home Address Line 1
    f95: o.homeAddr.locality,                                                   // 95	Home Address Line 2
    f96: o.homeAddr.cityCode,                                                   // 96	Home Address Line 3
    f97: o.homeAddr.countyCode,                                                 // 97	Home Address Line 4
    f98: o.homeAddr.countryCode,                                                // 98	Home Address Line 5
    f99: o.homeAddr.postalCode,                                                 // 99	Home Address Line 6
    f100: o.homeAddr.phoneNo,                                                   // 100	Home Address Line 7

    f101: formatContactPersonName(o.nextOfKin),
    f102: formatContactPersonRelationship(o.nextOfKin),                         // 102	NOK Address Relationship
    f103: formatAddressLine1(o.nextOfKin),                                      // 103	NOK Address Line 1
    f104: o.nextOfKin.locality,                                                 // 104	NOK Address Line 2
    f105: o.nextOfKin.cityCode,                                                 // 105	NOK Address Line 3
    f106: o.nextOfKin.countyCode,                                               // 106	NOK Address Line 4
    f107: o.nextOfKin.countryCode,                                              // 107	NOK Address Line 5
    f108: o.nextOfKin.postalCode,                                               // 108	NOK Address Line 6
    f109: o.nextOfKin.phoneNo,                                                  // 109	NOK Address Line 7

    f110: formatContactPersonName(o.offenderManager),                           // 110	Offender Manager
    f111: formatAddressLine1(o.offenderManager),                                // 111	Probation Address Line 1
    f112: o.offenderManager.locality,                                           // 112	Probation Address Line 2
    f113: o.offenderManager.cityCode,                                           // 113	Probation Address Line 3
    f114: o.offenderManager.countyCode,                                         // 114	Probation Address Line 4
    f115: o.offenderManager.countryCode,                                        // 115	Probation Address Line 5
    f116: o.offenderManager.postalCode,                                         // 116	Probation Address Line 6
    f117: o.offenderManager.phoneNo,                                            // 117	Probation Address Line 7

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

    f134: o.ltrn.fromAgencyLocationId,                                          // 134	Movement Establishment Name
    f135: o.ltrn.movementReasonCode,                                            // 135	Transfer Reason
    f136: moment(o.lmove.movementDate).format('DD/MM/YYYY'),                    // 136	Date Of Movement
    f137: moment(o.lmove.movementTime).format('HH'),                            // 137	Hour of Movement
    f138: moment(o.lmove.movementTime).format('mm'),                            // 138	Minute Of Movement
    f139: moment(o.lmove.movementTime).format('ss'),                            // 139	Second Of Movement
    f140: o.lmove.movementReasonCode,                                           // 140	Movement Code
    f141: o.courtEscort.toAgencyLocationId,                                     // 141	Court Name
    f142: o.courtEscort.escortCode,                                             // 142	Escort Type
    f143: moment(o.firstOutMovement.movementDate).format('DD/MM/YYYY'),         // 143	Date Of First Movement
    // 144	Employed
    // 145	Diary Details
    //     145a	Diary Details - Date (Movement)
    //     145b	Diary Details - Time (Movement)
    //     145c	Diary Details - Movement Reason Code
    //     145d	Diary Details - Movement Comment Text
    //     145e	Diary Details - Escort Type
    f145f: formatAlert(o.notForRelease),                                        // 145f	Diary Details - Not For Release Alert
    f146: formatLicenseType(o.licence),                                         // 146	Licence Type
    f147: [...otherOffences(o).reduce((x, c) => x.add(c.offenceCode), new Set())], // 147	Other Offences
    f148: o.activeAlerts.map(formatAlert),                                      // 148 (a&b)	Active Alerts
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
    f153: o.scd.tused,                                                          // 153	Top Up Supervision Expiry Date
  };

  for (let i = 0; i < 153; ) {
    i++;

    model[`f${i}`] = model[`f${i}`] ||
        (~['f31', 'f62', 'f63', 'f145', 'f147', 'f148', 'f152'].indexOf(`f${i}`) ? [] : "");
  }

  return model;
};
