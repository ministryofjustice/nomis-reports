const moment = require('moment');
const helpers = require('../helpers');

const getFirst = a => a[0] || {};
const getLast = a => a[a.length - 1] || {};
const withList = a => a || [];

const getTransfers = o =>
  (o.movements || []).filter(oem => (
    oem.movementTypeCode === 'TRN' &&
    oem.bookingId === o.mainBooking.bookingId
  ));

const getEmployments = o =>
  (o.employments || [])
    .filter(oe => (
      oe.employmentDate &&
      !oe.terminationDate &&
      oe.terminationDate &&
      oe.bookingId === o.mainBooking.bookingId
    ));

const getCharges = o =>
  (o.charges || [])
    .filter(oc => (
      oc.bookingId === o.mainBooking.bookingId
    ));

const getContactPersons = o =>
  (o.contactPersons || [])
    .filter(ocp => (
      ocp.bookingId === o.mainBooking.bookingId
    ));

const getMainOffence = o =>
  getFirst((o.offenderCharges || [])
    .filter(oc => (
      oc.chargeStatus === 'A'
    )));

const getFirstCharge = o =>
  getLast(o.offenderCharges);

const getReleaseDetails = o =>
  (o.releaseDetails || []).filter(ord => (
    ord.bookingId === o.mainBooking.bookingId
  ));

const getSentenceCalculations = o =>
  (o.sentenceCalculations || []).filter(s => (
    s.bookingId === o.mainBooking.bookingId
  )).reduce((a, b) => (!a.effectiveSentenceEndDate || moment(b.effectiveSentenceEndDate).diff(a.effectiveSentenceEndDate) > 0 ? b : a), moment(0)) || {};

const getSentence = o =>
  (o.sentences || []).filter(s => (
    s.sentenceStatus === 'A' &&
    s.bookingId === o.mainBooking.bookingId
  )).reduce((a, b) => (!a.startDate || moment(b.startDate).diff(a.startDate) > 0 ? b : a), moment(0)) || {};

const getLicense = o =>
  getFirst((o.sentences || []).filter(s => (
    s.sentenceStatus === 'A' &&
    s.bookingId === o.mainBooking.bookingId &&
    s.sentenceCategory === 'LICENSE'
  )));

const getFirstSentenceAndCounts = o =>
  (o.sentences || [])
    .filter(s => s.bookingId === o.mainBooking.bookingId)
    .reduce((a, b) => ({
      firstSentenced: b.courtDate < a.courtDate ? b.courtDate : a.courtDate || b.courtDate,
      firstActiveSentenceStart: b.sentenceStatus === 'A' && b.startDate < a.startDate ? b.startDate : a.startDate || b.startDate,
      sentences: a.sentences + 1,
      activeSentences: b.sentenceStatus === 'A' ? a.activeSentences + 1 : a.activeSentences,
      activeFineDefaultSentences:
        b.sentenceStatus === 'A' && b.sentenceCalcType === 'A/FINE' ? a.activeFineDefaultSentences + 1 : a.activeFineDefaultSentences,
    }), { sentences: 0, activeSentences: 0, activeFineDefaultSentences: 0}) || {};

const getOffenderAddresses = o =>
  (o.addresses || []).filter(oa => (
    oa.ownerClass === 'OFF' &&
    !oa.endDate && oa.active
  ));

const getIdentifiers = o =>
  (o.identifiers || []).reduce((x, oi) => { x[oi.identifierType] = oi.identifier; return x; }, {});

const getMaternityStatus = (o, sysdate) =>
  getFirst((o.healthProblems || []).filter(hp => (
    hp.bookingId === o.mainBooking.bookingId &&
    hp.problemType === 'MATSTAT' &&
    hp.problemStatus === 'ON' &&
  //hp.domain === 'HEALTH_PBLM' &&
    (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
  )));

const getSecurityCategory = o =>
  getFirst((o.assessments || []).filter(oa => (
    oa.bookingId === o.mainBooking.bookingId &&
    oa.evaluationResultCode === 'APP' &&
    oa.assessStatus === 'A' &&
    oa.assessmentType &&
    oa.assessmentType.assessmentClass === 'TYPE' &&
    oa.assessmentType.assessmentCode === 'CATEGORY' &&
    oa.assessmentType.determineSupLevelFlag === 'Y'
  )));

const getSecurityCategory2 = o =>
  getFirst((o.assessments || []).filter(oa => (
    oa.calcSupLevelType === 'Y' &&
    oa.evaluationResultCode === 'APP' &&
    oa.assessStatus === 'A' &&
    oa.assessmentType &&
    oa.assessmentType.assessmentClass === 'TYPE' &&
    oa.assessmentType.assessmentCode === 'CATEGORY'
  )));

const lastMovement = o =>
  getFirst(o.movements);

const firstMovement = o =>
  getLast(o.movements);

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

const otherOffences = o =>
  (o.oc || []).filter((o, i) => i !== 0);

const getHomeAddress = o =>
  getFirst((o.offenderAddresses || []).filter(a => (a.addressUsage === 'HOME')));

const getReceptionAddress = o =>
  getFirst((o.offenderAddresses || []).filter(a => (a.addressUsage === 'RECEP')));

const getDischargeAddress = o =>
  getFirst((o.offenderAddresses || []).filter(a => (~['RELEASE','DNF','DUT','DST','DPH','DSH','DAP','DBA','DOH','DBH'].indexOf(a.addressUsage))));

const getDischargeAddress2 = o =>
  getFirst((o.offenderAddresses || []).filter(a => (!~[ 'HOME', 'RECEP' ].indexOf(a.addressUsage))));

const getMainBooking = o =>
  getFirst(o.bookings);

const getPreviousBookings = o =>
  (o.bookings || []).reduce((a, b) => { if (!~a.indexOf(b.bookingNo)) a.push(b.bookingNo); return a; }, []);

const getNumberOfActiveBookings = o =>
  (o.bookings || []).filter(b => b.activeFlag).length || 0;

const getActiveAlerts = o =>
  ((o.alerts || []).filter(oa => !oa.expired) || []);

const getMAPPAAlerts = o =>
  getFirst((o.alerts || []).filter(oa => (!oa.expired && oa.alertType === 'P')));

const getNotForReleaseAlerts = o =>
  getFirst((o.alerts || []).filter(oa => (!oa.expired && oa.alertType === 'X' /*&& oa.alertStatus === 'ACTIVE'*/)));

const getAge = o =>
  moment().diff(moment(o.dateOfBirth), 'years');

const getNextOfKin = o =>
  getFirst((o.offenderContactPersons || []).filter(ocp => ocp.nextOfKin));

const formatTransferReasonCode = trn =>
  trn ? [trn.movementType, trn.movementReasonCode].filter(x => !!x).join('-') : undefined;

const formatReleaseReason = ord =>
  ord ? [ord.movementType, ord.movementReasonCode].filter(x => !!x).join('-') : undefined;

const formatLicenseType = os =>
  os ? [os.sentenceCategory, os.sentenceCalcType].filter(x => !!x).join('-') : undefined;

const formatAddressLine1 = a =>
  a ? [a.flat, a.premise, a.street].filter(x => !!x).join(' ') : undefined;

const formatAlert = oa =>
  oa ? [oa.alertType, oa.alertCode].filter(x => !!x).join('-') : undefined;

const formatIdentifyingMark = oim =>
  oim ? [oim.markType, oim.bodyPartCode].filter(x => !!x).join(' ') : undefined;

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
    { date: moment(o.releaseDetails.releaseDate),
      label: `REL-${o.releaseDetails.movementReasonCode}`,
      description: `Assessed Release - ${o.releaseDetails.description ? o.releaseDetails.description : 'Reason Not Stated'}`
    },
      { date: scd.hdced, label: 'hdced', description: '' },
      { date: scd.hdcad, label: 'hdcad', description: 'Home Detention Curfew Approved Date' },
      { date: scd.etd, label: 'etd', description: '' },
      { date: scd.mtd, label: 'mtd', description: 'Mid Term Release Date' },
      { date: scd.ltd, label: 'ltd', description: '' },
      { date: scd.crd, label: 'crd', description: 'Conditional Release Date' },
      { date: scd.ped, label: 'ped', description: '' },
      { date: scd.apd, label: 'apd', description: 'Approved Parole Date' },
      { date: scd.npd, label: 'npd', description: 'Non Parole Release Date' },
      { date: scd.ard, label: 'ard', description: 'Automatic Release Date' },
      { date: scd.prrd, label: 'prrd', description: 'Post Recall Release Date' },
      { date: scd.ard, label: 'ard', description: '' },
  ].sort((a, b) => a.date.diff(b.date))[0])(o.sentenceCalculationDates);

const getSentenceLengthValues = l => {
  let x = (l || '').split(/\//gmi);

  return {
    years: x[0] ? parseInt(x[0], 10) : 0,
    months: x[1] ? parseInt(x[1], 10) : 0,
    days: x[2] ? parseInt(x[2], 10) : 0,
  };
};

const sentenceCalculationDates = o =>
  (osc => ({
    effectiveSentenceLength: getSentenceLengthValues(osc.effectiveSentenceLength),
    judiciallyImposedSentenceLength: getSentenceLengthValues(osc.judiciallyImposedSentenceLength),
    effectiveSentenceEndDate: osc.effectiveSentenceEndDate,
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
    tused: moment(osc.tusedOverridedDate || osc.tusedCalculatedDate),
    prrd: moment(osc.prrdOverridedDate || osc.prrdCalculatedDate),
    ersed: moment(osc.ersedOverridedDate || osc.ersedCalculatedDate),
    tersed: moment(osc.tersedOverridedDate || osc.tersedCalculatedDate),
    rotl: moment(osc.rotlOverridedDate || osc.rotlCalculatedDate),
    tariff: moment(osc.tariffOverridedDate || osc.tariffCalculatedDate),
  }))(o.offenderSentenceCalculations);

const getNFA = oa => {
  if (~['RELEASE', 'HOME', 'RECEP'].indexOf(oa.addressUsage)) {
    return oa.noFixedAddress ? 'NFA' : undefined;
  }

  return oa.addressUsage;
};

const getCheckHoldAlerts = o =>
  (o.activeAlerts || []).reduce((x, oa) => {
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

const getOffenceGroups = o =>
  withList(o.charges).reduce((x, oc) => {
    x.drugOffences = ~withList(oc.offenceIndicatorCodes).indexOf('D') ? true : x.drugOffences;
    x.harassmentOffences = ~withList(oc.offenceIndicatorCodes).indexOf('H') ? true : x.harassmentOffences;
    x.raciallyAggravated = ~withList(oc.offenceIndicatorCodes).indexOf('RA') ? true : x.raciallyAggravated;
    x.religiouslyAggravated = ~withList(oc.offenceIndicatorCodes).indexOf('REA') ? true : x.religiouslyAggravated;
    x.sexual = ~withList(oc.offenceIndicatorCodes).indexOf('S') ? true : x.sexual;
    x.riskToChildren = ~withList(oc.offenceIndicatorCodes).indexOf('S1') ? true : x.riskToChildren;
    x.sexOffenderRegister = ~withList(oc.offenceIndicatorCodes).indexOf('SOR') ? true : x.sexOffenderRegister;
    x.violent = ~withList(oc.offenceIndicatorCodes).indexOf('V') ? true : x.violent;
    x.victimOffences = ~withList(oc.offenceIndicatorCodes).indexOf('VO') ? true : x.victimOffences;

    return x;
  }, {
    drugOffences: false,
    harassmentOffences: false,
    raciallyAggravated: false,
    religiouslyAggravated: false,
    sexual: false,
    riskToChildren: false,
    sexOffenderRegister: false,
    violent: false,
    victimOffences: false,
  });

const getPhysicals = o => {
  let physicals = getFirst((o.physicals || []).filter(op => (op.bookingId === o.mainBooking.bookingId)));

  return {
    profileDetails: (physicals.profileDetails || [])
        .reduce((x, opd) => { x[opd.profileType] = opd.profileCode; return x; }, {}),
    identifyingMarks: (x => {
      x.BODY = [...(x.BODY || [])];
      x.HEAD = [...(x.HEAD || [])];
      return x;
    })((physicals.identifyingMarks || [])
        .reduce((x, oim) => {
          let area = (~[ 'EAR', 'FACE', 'HEAD', 'LIP', 'NECK', 'NOSE' ].indexOf(oim.bodyPartCode)) ? 'HEAD' : 'BODY';

          (x[area] = x[area] || new Set()).add(formatIdentifyingMark(oim));

          return x;
        }, {})),
    physicalAttributes: (physicals.physicalAttributes || [])
        .reduce((x, opa) => (x || opa), false),
  };
};

const getIEPLevel = o =>
  getFirst((o.IEPs || [])
    .filter(op => (op.bookingId === o.mainBooking.bookingId))
    .map(iep => iep.iepLevel.iepLevel));

const getCSRALevel = o =>
  getFirst((o.assessments || [])
    .filter(oa => (
      oa.assessmentType &&
      oa.assessmentType.assessmentClass === 'TYPE' &&
      oa.assessmentType.cellSharingAlertFlag
    )));

const getEmployment = o =>
  getFirst((o.employments || [])
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      (!oe.terminationDate || moment(oe.terminationDate).diff(o.mainBooking.startDate) > 0)
    )));

const getImprisonmentStatus = o =>
  getFirst((o.imprisonmentStatuses || [])
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    )));

const getImprisonmentStatus2 = o =>
  getFirst((o.imprisonmentStatuses || [])
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId &&
      op.latestStatus
    )));


const getImprisonmentStatusCategory = ois => {
  switch (ois.bandCode) {
    case 0: return 'Dead';
    case 1: return 'Indefinite Sentence';
    case 2:
    case 3: return 'Sentenced';
    case 4:
    case 5:
    case 6:
    case 7: return 'Convicted Unsentenced';
    case 8:
    case 11: return 'Immigration Detainees';
    case 9:
    case 10: return 'Civil Prisoners';
    case 12:
    case 13:
    case 14: return 'Remand';
    default:
      return ois.imprisonmentStatus === 'Unknown' ? 'Unknown' : 'Other';
  }
};

const formatSentenceLength = o => {
  if (o.offenderImprisonmentStatus.bandCode === 1 ||
      !o.sentenceCalculationDates ||
      !o.sentenceCalculationDates.effectiveSentenceEndDate) {
    return 'Indefinate';
  }

  let sentence = o.sentenceCalculationDates.effectiveSentenceEndDate;

  if (sentence.years >= 4) {
    return '4 years or over';
  }

  if (sentence.years >= 1) {
    return '12 months to less than 4 years';
  }

  if (sentence.years > 6 || (sentence.months === 6 && sentence.days > 0)) {
          return 'More than 6 months to less than 12 months';
  }

  if (sentence.months === 6) {
    return '6 months';
  }

  return 'Less than 6 months';
};

module.exports.build = (data) => {
  let o = [
    ['sysdate', () => moment()],
    ['mainBooking', getMainBooking],
    ['activeBookings', getNumberOfActiveBookings],
    ['offenderIdentifiers', getIdentifiers],
    ['offenderAddresses', getOffenderAddresses],
    ['offenderCharges', getCharges],
    ['offenderContactPersons', getContactPersons],
    ['offenderSentence', getSentence],
    ['offenderSentenceCalculations', getSentenceCalculations],
    ['sentenceCalculationDates', sentenceCalculationDates],
    ['homeAddress', getHomeAddress],
    ['receptionAddress', getReceptionAddress],
    ['dischargeAddress', getDischargeAddress2],
    ['nextOfKin', getNextOfKin],
    ['securityCategory', getSecurityCategory2],
    ['csraLevel', getCSRALevel],
    ['checkHoldAlerts', getCheckHoldAlerts],
    ['firstSentenceAndCounts', getFirstSentenceAndCounts],
    ['lastMovement', lastMovement],
    ['firstMovement', firstMovement],
    ['mainOffence', getMainOffence],
    ['firstOffence', getFirstCharge],
    ['offenderImprisonmentStatus', getImprisonmentStatus2],
    ['releaseDetails', getReleaseDetails],
    ['earliestReleaseDate', earliestReleaseDate],
    ['physicals', getPhysicals],
    ['IEPLevel', getIEPLevel],
    ['offenceGroups', getOffenceGroups]
  ].reduce((x, p) => { x[p[0]] = p[1](x); return x; }, Object.assign({}, data));

  o.maternityStatus = getMaternityStatus(o, o.sysdate);

  let model = {
  //record_number: o.record_number,

//offender_booking_q
    nomis_no: o.nomsId,
    booking_no: o.mainBooking.bookingNo,
    offender_book_id: o.mainBooking.bookingId,
    cro_no: o.offenderIdentifiers.CRO,
    pncid_no: o.offenderIdentifiers.PNC,
    dob: moment(o.dateOfBirth).format('DD/MM/YYYY'),
    age: getAge(o),
    gender: o.sexCode,
    race: o.raceCode,
    surname: o.surname,
    forename1: o.firstName,
    forename2: o.middleName,
    offenders_active_bookings: o.activeBookings,
    living_unit_id: o.mainBooking.livingUnitId,
    agy_loc_id: o.mainBooking.agencyLocationId,
    in_out_status: o.mainBooking.inOutStatus,

//pivoted_profiles_q
    adult_yp: o.physicals.profileDetails.YOUTH,
    nationality_short: o.physicals.profileDetails.NAT,
    religion_short: o.physicals.profileDetails.RELF,
    marital_status_short: o.physicals.profileDetails.MARITAL,

//preferred_pregnancy_q
    maternity_status_short: o.maternityStatus.problemCode,
    maternity_ongoing_or_inactive: o.maternityStatus.problemStatus,

//latest_iep_level_q
    iep: o.IEPLevel.iepLevel,

//csra_level
    csra_level: (o.csraLevel.reviewSupLevelType || o.csraLevel.overridedSupLevelType || o.csraLevel.calcSupLevelType),

//latest_created_case_q
    court_code: (o.mainOffence.case && o.mainOffence.case.agencyLocationId),

//pivotted_offender_addresses_q
    home_flat: o.homeAddress.flat,
    home_premise: o.homeAddress.premise,
    home_street: o.homeAddress.street,
    home_locality: o.homeAddress.locality,
    home_city: o.homeAddress.cityCode,
    home_county: o.homeAddress.countyCode,
    home_postal_code: o.homeAddress.postalCode,
    home_country: o.homeAddress.countryCode,
    home_no_fixed_address: o.homeAddress.noFixedAddress,

//pivotted_offender_addresses_q
    next_of_kin_flat: getFirst(withList(o.nextOfKin.addresses)).flat,
    next_of_kin_premise: getFirst(withList(o.nextOfKin.addresses)).premise,
    next_of_kin_street: getFirst(withList(o.nextOfKin.addresses)).street,
    next_of_kin_locality: getFirst(withList(o.nextOfKin.addresses)).locality,
    next_of_kin_city: getFirst(withList(o.nextOfKin.addresses)).city,
    next_of_kin_county: getFirst(withList(o.nextOfKin.addresses)).county,
    next_of_kin_postal_code: getFirst(withList(o.nextOfKin.addresses)).postalCode,
    next_of_kin_country: getFirst(withList(o.nextOfKin.addresses)).country,
    next_of_kin_no_fixed_address: getFirst(withList(o.nextOfKin.addresses)).noFixedAddress,

//pivotted_offender_addresses_q
    discharge_flat: o.dischargeAddress.flat,
    discharge_premise: o.dischargeAddress.premise,
    discharge_street: o.dischargeAddress.street,
    discharge_locality: o.dischargeAddress.locality,
    discharge_city: o.dischargeAddress.cityCode,
    discharge_county: o.dischargeAddress.countyCode,
    discharge_postal_code: o.dischargeAddress.postalCode,
    discharge_country: o.dischargeAddress.countryCode,
    discharge_no_fixed_address: o.dischargeAddress.noFixedAddress,
    discharge_address_type: o.dischargeAddress.addressType,

//pivotted_offender_addresses_q
    reception_flat: o.receptionAddress.flat,
    reception_premise: o.receptionAddress.premise,
    reception_street: o.receptionAddress.street,
    reception_locality: o.receptionAddress.locality,
    reception_city: o.receptionAddress.cityCode,
    reception_county: o.receptionAddress.countyCode,
    reception_postal_code: o.receptionAddress.postalCode,
    reception_country: o.receptionAddress.countryCode,
    reception_no_fixed_address: o.receptionAddress.noFixedAddress,

//latest_security_assessment_q
    sec_cat_short: o.securityCategory.reviewSupLevelType || 'Z',
    sec_cat_assessment_date: moment(o.securityCategory.assessmentDate).format('DD/MM/YYYY'),
    sec_cat_next_review_date: moment(o.securityCategory.nextReviewDate).format('DD/MM/YYYY'),

//first_conviction_q
    first_convicted: (o.firstOffence.case && o.firstOffence.case.beginDate && moment(o.firstOffence.case.beginDate).format('DD/MM/YYYY')),

//first_sentence_and_counts_q
    first_sentenced: moment(o.firstSentenceAndCounts.firstSentenced).format('DD/MM/YYYY'),
    sentences: o.firstSentenceAndCounts.sentences,
    active_sentences: o.firstSentenceAndCounts.activeSentences,
    active_fine_default_sentences: o.firstSentenceAndCounts.activeFineDefaultSentences,

//imp_status_sentence_release_q
    imprisonment_status_short: o.offenderImprisonmentStatus.imprisonmentStatus,
    sentence_start_to_end_days: moment(o.offenderSentenceCalculations.effectiveSentenceEndDate).diff(moment(o.offenderSentence.startDate), 'years'),
    sentence_length_years: o.sentenceCalculationDates.effectiveSentenceLength.years,
    sentence_length_months: o.sentenceCalculationDates.effectiveSentenceLength.months,
    sentence_length_days: o.sentenceCalculationDates.effectiveSentenceLength.days,
    indefinite_sentence: (o.offenderImprisonmentStatus.bandCode === 1 ? 'Y' : 'N'),
    date_of_release: o.earliestReleaseDate.date,
    release_name_short: o.earliestReleaseDate.label,
    release_name_long: o.earliestReleaseDate.description,
    sed: o.sentenceCalculationDates.sed,
    hdced: o.sentenceCalculationDates.hdced,
    ped: o.sentenceCalculationDates.ped,
    hdcad: o.sentenceCalculationDates.hdcad,
    ersed: o.sentenceCalculationDates.ersed,
    tersed: o.sentenceCalculationDates.tersed,
    apd: o.sentenceCalculationDates.apd,
    rotl: o.sentenceCalculationDates.rotl,
    tariff: o.sentenceCalculationDates.tariff,
    status_rank: o.offenderImprisonmentStatus.statusRank,
    sentence_length_banded: formatSentenceLength(o),
    imprisonment_status_category: getImprisonmentStatusCategory(o.offenderImprisonmentStatus),
    jisl_years: o.sentenceCalculationDates.judiciallyImposedSentenceLength.years,
    jisl_months: o.sentenceCalculationDates.judiciallyImposedSentenceLength.months,
    jisl_days: o.sentenceCalculationDates.judiciallyImposedSentenceLength.days,

//first_and_last_movement_date_q
    first_movement_date: moment(o.firstMovement.movementDateTime).format('DD/MM/YYYY'),

//offender_booking_q
    last_movement_type_code: o.lastMovement.movementTypeCode,
    last_movement_reason_code: o.lastMovement.movementReasonCode,
    last_movement_direction: o.lastMovement.movementDirection,
    last_movement_from_id: o.lastMovement.fromAgencyLocationId,
    last_movement_to_id: o.lastMovement.toAgencyCodeLocationId,
    last_movement_date: moment(o.lastMovement.movementDateTime).format('DD/MM/YYYY'),

//preferred_self_harm_alert_q
    f2052_status: o.checkHoldAlerts.SH_STS,
    f2052_start: o.checkHoldAlerts.SH_Date,

//main_offence_q
    main_offence_code: o.mainOffence.offenceCode,
    main_offence_statute_code: o.mainOffence.statuteCode,

//offence_groups_q
    drug_offences: (o.offenceGroups.drugOffences ? 'Y' : 'N'),
    harassment_offences: (o.offenceGroups.harassment_offences ? 'Y' : 'N'),
    racially_aggravated: (o.offenceGroups.racially_aggravated ? 'Y' : 'N'),
    religiously_aggravated: (o.offenceGroups.religiously_aggravated ? 'Y' : 'N'),
    sexual: (o.offenceGroups.sexual ? 'Y' : 'N'),
    risk_to_children: (o.offenceGroups.risk_to_children ? 'Y' : 'N'),
    sex_offender_register: (o.offenceGroups.sex_offender_register ? 'Y' : 'N'),
    violent: (o.offenceGroups.violent ? 'Y' : 'N'),
    victim_offences: (o.offenceGroups.victim_offences ? 'Y' : 'N'),

/*
//rehab_decision_provider_q
    rehab_decision_code: r.decision_code,
    rehab_decision: r.decision,
    rehab_provider_code: r.provider_code,
    rehab_provider: r.provider,
*/
  };

  return model;
};
