const moment = require('moment');
const helpers = require('../helpers');

const getFirst = a => a[0] || {};
const getLast = a => a[a.length - 1] || {};

const getTransfers = o =>
  (o.movements || []).filter(oem => (
    oem.movementTypeCode === 'TRN' &&
    oem.offenderBookingId === o.ob.offenderBookingId
  ));

const getEmployments = o =>
  (o.employments || []).filter(oe => (
    oe.employmentDate &&
    !oe.terminationDate &&
    oe.bookingId === o.ob.offenderBookingId
  ));
/*
SELECT
  oe.employment_post_code emplmnt_status_discharge_f49
FROM offender_employments oe
ORDER BY
  oe.modify_datetime,
  oe.create_datetime
*/

const getCharges = o =>
  (o.charges || []).filter(oc => (
    oc.bookingId === o.ob.offenderBookingId
  ));

const getReleaseDetails = o =>
  (o.releaseDetails || []).filter(ord => (
    ord.bookingId === o.ob.offenderBookingId
  ));

const getSentenceCalculations = o =>
  (o.sentenceCalculations || []).filter(s => (
    s.bookingId === o.ob.offenderBookingId
  )).reduce((a, b) => (!a.effectiveSentenceEndDate || moment(b.effectiveSentenceEndDate).diff(a.effectiveSentenceEndDate) > 0 ? b : a), moment(0)) || {};

const getSentences = o =>
  (o.sentences || []).filter(s => (
    s.sentenceStatus === 'A' &&
    s.bookingId === o.ob.offenderBookingId
  )).reduce((a, b) => (!a.startDate || moment(b.startDate).diff(a.startDate) > 0 ? b : a), moment(0)) || {};

const getOffenderAddresses = o =>
  (o.addresses || []).filter(oa => (
    oa.ownerClass === 'OFF' &&
    !oa.endDate && oa.active
  ));

const getID = id => o =>
  getFirst((o.identifiers || []).filter(oi => (
    oi.identifierType === id
  )));

const getIdentifiers = o =>
  (o.identifiers || []).reduce((x, oi) => { x[oi.identifierType] = oi.identifier; return x; }, {});

const getLicense = o =>
  getFirst((o.sentences || []).filter(s => (
    s.sentenceStatus === 'A' &&
    s.bookingId === o.ob.offenderBookingId &&
    s.sentenceCategory === 'LICENSE'
  )));

const getMaternityStatus = (o, sysdate) =>
  getFirst((o.healthProblems || []).filter(hp => (
    hp.bookingId === o.ob.offenderBookingId &&
    hp.problemType === 'MATSTAT' &&
    hp.problemStatus === 'ON' &&
  //hp.domain === 'HEALTH_PBLM' &&
    (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
  )));

const getSecurityCategory = o =>
  getFirst((o.assessments || []).filter(oa => (
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
  getLast((o.trn || []).filter(m => m.active));

const courtEscort = o =>
  getFirst((o.trn || []).filter(m => (m.movementType === 'CRT' && m.directionCode === 'OUT')));

const firstOutMovement = o =>
  getLast((o.movements || []).filter(m => (m.directionCode === 'OUT')));

const receptionEmployment = o =>
  getLast(o.oe);

const dischargeEmployment = o =>
  getFirst(o.oe);

const highestRankedOffence = o =>
  getFirst(o.oc);

const getHomeAddress = o =>
  getFirst((o.oa || []).filter(a => (a.addressUsage === 'HOME')));

const getReceptionAddress = o =>
  getFirst((o.oa || []).filter(a => (a.addressUsage === 'RECEP')));

const getDischargeAddress = o =>
  getFirst((o.oa || []).filter(a => (~['RELEASE','DNF','DUT','DST','DPH','DSH','DAP','DBA','DOH','DBH'].indexOf(a.addressUsage))));

const getMainBooking = o =>
  getFirst(o.bookings);

const getPreviousBookings = o =>
  (o.bookings || []).reduce((a, b) => { if (!~a.indexOf(b.bookingNo)) a.push(b.bookingNo); return a; }, []);

const getCRO = getID('CRO');
const getPNC = getID('PNC');

const getAge = o =>
  moment().diff(moment(o.dateOfBirth), 'years');

const formatTransferReasonCode = trn =>
  trn ? [trn.movementType, trn.movementReasonCode].filter(x => !!x).join('-') : undefined;

const formatReleaseName = ord =>
  ord ? [ord.movementType, ord.movementReasonCode].filter(x => !!x).join('-') : undefined;

const formatLicenseType = os =>
  os ? [os.sentence_category, os.sentence_calc_type].filter(x => !!x).join('-') : undefined;

const formatAddressLine1 = a =>
  a ? [a.flat, a.premise, a.street].filter(x => !!x).join(' ') : undefined;

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
    led: moment(osc.ledOverridedDate || osc.ledCalculatedDate)
  }))(o.osc);

const getNFA = oa => {
  if (~['RELEASE', 'HOME', 'RECEP'].indexOf(oa.addressUsage)) {
    return oa.noFixedAddress ? 'NFA' : undefined;
  }

  return oa.addressUsage;
};

module.exports.build = (data) => {
  let o = [
    ['sysdate', () => moment()],
    ['ob', getMainBooking],
    ['previousBookingNos', getPreviousBookings],
    ['offenderIdentifiers', getIdentifiers],
    ['secCat', getSecurityCategory],
    ['osc', getSentenceCalculations],
    ['os', getSentences],
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
    ['oa', getOffenderAddresses],
    ['homeAddr', getHomeAddress],
    ['recepAddr', getReceptionAddress],
    ['dischargeAddr', getDischargeAddress],
  ].reduce((x, p) => { x[p[0]] = p[1](x); return x; }, Object.assign({}, data));

  let model = {
    f1: o.sysdate.format('DD/MM/YYYY'),                                         // 1	System Date
    f2: o.ob.agencyLocationId,                                                  // 2	Establishment
    f3: o.ob.agencyLocationId,                                                  // 3	Prison Code
    f4: o.nomsId,                                                               // 4	NOMS Number
    f5: o.sexCode,                                                              // 5	Gender Description
    f6: o.ob.bookingNo,                                                         // 6	Booking Number
    f7: o.surname,                                                              // 7	Last Name
    f8: o.firstName,                                                            // 8	Given Name 1
    f9: o.middleNames,                                                          // 9	Given Name 2
    f10: o.offenderIdentifiers.CRO,                                             // 10	CRO Number
    // 11	Adult or YP
    f12: getAge(o),                                                             // 12	Age
    f13: moment(o.dateOfBirth).format('DD/MM/YYYY'),                            // 13	DOB
    // 14	Nationality Description
    f15: o.raceCode,                                                            // 15	Ethnicity Description
    // 16	Religion Description
    // 17	Marital Status Description
    f18: getMaternityStatus(o, o.sysdate).problem_code,                          // 18	Maternity Status Description
    f19: o.ob.livingUnitId,                                                     // 19	Cell Location
    // 20	Incentive Level Description
    // 21	Occupation Description
    f22: formatTransferReasonCode(o.ftrn),                                      // 22	Transfer Reason
    f23: moment(o.ob.startDate).format('DD/MM/YYYY'),                           // 23	First Reception Date
    f24: getCustodyStatus(o),                                                   // 24	Custody Status
    // 25	Main Legal Status Description
    f26: o.secCat.reviewSupLevelType,                                           // 26	Security Category Description
    f27: (o.secCat.nextReviewDate && moment(o.secCat.nextReviewDate).format('DD/MM/YYYY')),// 27	Security Category Review Date
    f28: (o.osc.effectiveSentenceLength || '').split(/\//gmi)[0],               // 28	Sentence Length (Years)
    f29: (o.osc.effectiveSentenceLength || '').split(/\//gmi)[1],               // 29	Sentence Length (Months)
    f30: (o.osc.effectiveSentenceLength || '').split(/\//gmi)[2],               // 30	Sentence Length (Days)
    f31: o.previousBookingNos.join(','),                                        // 31	Previous Booking Number
    f32: earliestReleaseDate(o).format('DD/MM/YYYY'),                           // 32	Earliest Release Date
    // 33	Check Hold Governor
    // 34	Check Hold General (to be left blank)
    // 35	Check Hold Discipline (to be left blank)
    // 36	Check Hold Allocation
    // 37	Check Hold Security
    // 38	Check Hold Medical
    // 39	Check Hold Parole
    // 40	Date Of First Conviction
    // 41	Date First Sentenced
    // 42	ACCT Status (F2052)
    f43: highestRankedOffence(o).offenceCode,                                   // 43	Highest Ranked Offence
    // 44	Status Rank (to be left blank)
    f45: o.pendingTransfer.toAgencyLocationId,                                               // 45	Pending Transfers (Full Establishment Name)
    f46: o.pendingTransfer.fromAgencyLocationId,                                             // 46	Received From
    // 47	Vulnerable Prisoner Alert
    f48: o.offenderIdentifiers.PNC,                                             // 48	PNC Number
    f49: dischargeEmployment(o).employmentPostCode,                             // 49	Employment Status at Discharge
    f50: receptionEmployment(o).employmentPostCode,                             // 50	Employment Status at Reception
    // 51	MAPPA Levels (Schedule 1 Sex Offender)
    // 52	Sex Offender
    // 53	Supervising Service
    // 54	Height (metres)
    // 55	Complexion
    // 56	Hair Colour
    // 57	Left Eye
    // 58	Right Eye
    // 59	Build
    // 60	Facial Shape
    // 61	Facial Hair
    // 62	Physical Mark  Head
    // 63	Physical Mark Body
    f64: moment(o.osc.effectiveSentenceEndDate).diff(moment(o.os.startDate), 'years'),// 64	Effective Sentence Length
    f55: moment(getReleaseDetails(o).releaseDate).format('DD/MM/YYYY'),         // 65	Confirmed Release Date
    f66: formatReleaseName(getReleaseDetails(o)),                               // 66	Release Reason
    f67: o.scd.sed,                                                             // 67	SED
    f68: o.scd.hdced,                                                           // 68	HDCED
    f69: o.scd.hdcad,                                                           // 69	HDCAD
    f70: o.scd.ped,                                                             // 70	PED
    f71: o.scd.crd,                                                             // 71	CRD
    f72: o.scd.npd,                                                             // 72	NPD
    f73: o.scd.led,                                                             // 73	LED
    f74: o.secCat.evaluationDate && moment(o.secCat.evaluationDate).format('DD/MM/YYYY'),// 74	Date Security Category Changed
    // 75	Rule 45/YOI Rule 49
    // 76	ACCT (Self Harm) Status
    // 77  ACCT (Self Harm) Start Date

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

    // 101	Nominated NOK
    // 102	NOK Address Relationship
    // 103	NOK Address Line 1
    // 104	NOK Address Line 2
    // 105	NOK Address Line 3
    // 106	NOK Address Line 4
    // 107	NOK Address Line 5
    // 108	NOK Address Line 6
    // 109	NOK Address Line 7

    // 110	Offender Manager
    // 111	Probation Address Line 1
    // 112	Probation Address Line 2
    // 113	Probation Address Line 3
    // 114	Probation Address Line 4
    // 115	Probation Address Line 5
    // 116	Probation Address Line 6
    // 117	Probation Address Line 7

    // 118	Remark Type Allocation
    // 119	Remarks Allocation
    // 120	Remark Type Security
    // 121	Remarks Security
    // 122	Remark Type Medical
    // 123	Remarks Medical
    // 124	Remark Type Parole
    // 125	Remarks Parole
    // 126	Remark Type Discipline
    // 127	Remarks Discipline
    // 128	Remark Type General
    // 129	Remarks General
    // 130	Remark Type Reception
    // 131	Remarks Reception
    // 132	Remark Type Labour
    // 133	Remarks Labour

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
    //     145f	Diary Details - Not For Release Alert
    f146: formatLicenseType(o.licence),                                         // 146	Licence Type
    // 147	Other Offences
    // 148 (a&b)	Active Alerts
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
    // 153	Top Up Supervision Expiry Date
  };

  return model;
};
