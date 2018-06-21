const moment = require('moment');

let helpers = {};

const getFirst = helpers.getFirst = a => a[0] || {};
const getLast = helpers.getLast = a => a[a.length - 1] || {};
const withList = helpers.withList = a => a || [];

helpers.pipe = p => ({
  apply(x) {
    return p.reduce((x, fn) => {
      x[fn[0]] = fn[1](x);
      return x;
    }, Object.assign({}, x));
  }
});

const optionalDate = helpers.optionalDate = d =>
  d ? moment(moment(d).format('YYYY-MM-DDT00:00:00.000Z')) : undefined;

const optionalTime = helpers.optionalTime = d =>
  d ? moment(d).format('HH:mm:ss') : undefined;

helpers.optionalHeight = n =>
  n ? n / 100 : undefined;

helpers.formatTransferReasonCode = trn =>
  trn ? [trn.movementType, trn.movementReasonCode]
    .filter(x => !!x)
    .join('-') : undefined;

helpers.formatReleaseReason = ord =>
  ord ? [ord.movementType, ord.movementReasonCode]
    .filter(x => !!x)
    .join('-') : undefined;

helpers.formatLicenseType = os =>
  os ? [os.sentenceCategory, os.sentenceCalcType]
    .filter(x => !!x)
    .join('-') : undefined;

const formatAddressLine1 = helpers.formatAddressLine1 = a =>
  a ? [a.flat, a.premise, a.street]
    .filter(x => !!x)
    .join(' ') : undefined;

helpers.formatSupervisingService = om =>
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

const formatAlert = helpers.formatAlert = oa =>
  oa ? [oa.alertType, oa.alertCode]
    .filter(x => !!x)
    .join('-') : undefined;

helpers.formatIdentifyingMark = oim =>
  oim ? [oim.markType, oim.bodyPartCode]
    .filter(x => !!x)
    .join(' ') : undefined;

helpers.formatContactPersonName = ocp =>
  ocp && ocp.person ? [ocp.person.lastName, ocp.person.firstName]
    .filter(x => !!x)
    .join(' ') : undefined;

helpers.formatContactPersonRelationship = ocp =>
  ocp ? (['Y', 'NFA'].indexOf(ocp.noFixedAddress) ? ocp.noFixedAddress : null) : undefined;

helpers.formatAdultOrYouth = x => {
  switch (x) {
    case 'Y': return 'YP';
    case 'N': return 'A';
    default: x;
  }
};

helpers.formatOffenderDiaryDetail = (odd, o) =>
  ({
    date_145a: optionalDate(odd.movementDateTime),
    time_145b: optionalTime(odd.movementDateTime),
    reason_code_145c: odd.movementReasonCode || "",
    comment_text_145d: odd.comments || "",
    escort_type_145e: odd.escortType || "",
    not_for_release_alert_145f: formatAlert(o.notForRelease),
  });

helpers.getMainBooking = o =>
  getFirst(withList(o.bookings));

helpers.getPreviousBookings = o =>
  withList(o.bookings)
    .reduce((a, b) => {
      if (b.bookingNo !== o.mainBooking.bookingNo && !~a.indexOf(b.bookingNo)) {
        a.push(b.bookingNo);
      }
      return a;
    }, []);

helpers.getMainAlias = o =>
  withList(o.aliases)
    .reduce((x, oa) => (o.mainBooking && (oa.offenderId === o.mainBooking.offenderId) ? oa : x), {
      nomsId: o.nomsId,
      firstName: o.firstName,
      middleNames: o.middleNames,
      surname: o.surname,
      dateOfBirth: o.dateOfBirth,
      sexCode: o.sexCode,
      raceCode: o.raceCode,
      offenderId: o.offenderId,
    }) || {};

helpers.getOffenderTransfers = o =>
  withList(o.movements)
    .filter(oem => (
      oem.bookingId === o.mainBooking.bookingId &&
      oem.movementTypeCode === 'TRN'
    ));

helpers.getOffenderEmployments = o =>
  withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      oe.employmentDate &&
      !oe.terminationDate
    ));

helpers.getCharges = o =>
  withList(o.charges)
    .filter(oc => (
      oc.bookingId === o.mainBooking.bookingId
    ));

helpers.getContactPersons = o =>
  withList(o.contactPersons)
    .filter(ocp => (
      ocp.bookingId === o.mainBooking.bookingId &&
      ocp.active &&
      !getFirst(withList(ocp.addresses)).endDate
    ));

helpers.getMaternityStatus = (o, sysdate) =>
  getFirst(withList(o.healthProblems)
    .filter(hp => (
      hp.bookingId === o.mainBooking.bookingId &&
      hp.problemType === 'MATSTAT' &&
      hp.problemStatus === 'ON' &&
    //hp.domain === 'HEALTH_PBLM' &&
      (!hp.endDate || moment(hp.endDate).diff(sysdate) > 0)
    )));

helpers.getReleaseDetails = o =>
  withList(o.releaseDetails)
    .filter(ord => (
      ord.bookingId === o.mainBooking.bookingId
    ));

helpers.getOffenderSentences = o =>
  withList(o.sentences)
    .filter(s => (
      s.bookingId === o.mainBooking.bookingId
    ));

helpers.getOffenderSentenceCalculations = o =>
  getFirst(withList(o.sentenceCalculations)
    .filter(s => (
      s.bookingId === o.mainBooking.bookingId
    )));

helpers.getOffenderSecurityCategory = o =>
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

helpers.getIEPLevel = o =>
  getFirst(withList(o.ieps)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    ))
    .map(iep => iep.iepLevel)) || { iepLevel: 'STD' };

helpers.getEmployment = o =>
  getFirst(withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      (oe.terminationDate || moment(oe.terminationDate).diff(o.mainBooking.startDate) > 0)
    )));

helpers.getImprisonmentStatus = o =>
  getFirst(withList(o.imprisonmentStatuses)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    ))
  ) || { imprisonmentStatusCode: 'Unknown Sentenced'};

helpers.getPhysicals = o => {
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

helpers.getCourtOutcome = o =>
  getFirst(withList(o.courtEvents)
    .filter(ce =>
      ce.bookingId === o.mainBooking.bookingId &&
      ce.directionCode === 'OUT'
    ));

// main booking entire

helpers.getOffenderSentence = o =>
  withList(o.offenderSentences)
    .reduce((a, b) => (
      !a.startDate || moment(b.startDate).diff(a.startDate) < 0 ? b : a
    ), {}) || {};

helpers.getOffenderLicense = o =>
  getFirst(withList(o.offenderSentences)
    .filter(s => (
      s.sentenceCategory === 'LICENCE'
    )));

helpers.getOffenderSentenceLength = o =>
  moment(o.offenderSentenceCalculations.effectiveSentenceEndDate)
    .diff(moment(o.offenderSentence.startDate), 'days') + 1;

helpers.getActiveOffenderAddresses = o =>
  withList(o.addresses)
    .filter(oa => (
      !oa.endDate &&
      oa.active
    ));

helpers.mapOffenderIdentifiers = o =>
  withList(o.identifiers)
    .reduce((x, oi) => {
      x[oi.identifierType] = oi.identifier;
      return x;
    }, {});

helpers.getFirstOffenderTransfer = o =>
  getLast(o.offenderTransfers);

helpers.getLastOffenderTransfer = o =>
  getFirst(o.offenderTransfers
    .filter(m => m.active)); // TODO: movement date before extract date?

helpers.getPendingOffenderTransfer = o =>
  getLast(o.offenderTransfers
    .filter(m => m.active)); // TODO: movement date after extract date?

helpers.getLastOffenderMovement = o =>
  getFirst(withList(o.movements));

helpers.getFirstOffenderOutMovement = o =>
  getLast(withList(o.movements)
    .filter(m => (
      m.movementDirection === 'OUT'
    )));

helpers.getOffenderCourtEscort = o =>
  getFirst(withList(o.movements)
    .filter(m => (
      m.movementTypeCode === 'CRT' &&
      m.movementDirection === 'OUT'
    )));

helpers.receptionEmployment = o =>
  getLast(o.offenderEmployments);

helpers.dischargeEmployment = o =>
  getFirst(o.offenderEmployments);

helpers.highestRankedOffence = o =>
  getFirst(o.offenderCharges);

helpers.otherOffences = o =>
  withList(o.offenderCharges)
    .filter((o, i) => i !== 0);

helpers.getOffenderHomeAddress = o =>
  getFirst(withList(o.offenderAddresses)
    .filter(a => (a.addressUsage === 'HOME')));

helpers.getOffenderReceptionAddress = o =>
  getFirst(withList(o.offenderAddresses)
    .filter(a => (a.addressUsage === 'RECEP')));

helpers.getOffenderDischargeAddress = o =>
  getFirst(withList(o.offenderAddresses)
    .filter(a => (~['RELEASE','DNF','DUT','DST','DPH','DSH','DAP','DBA','DOH','DBH'].indexOf(a.addressUsage))));

helpers.getActiveAlerts = o =>
  withList(o.alerts)
    .filter(oa => !oa.expired);

// Multi Agency Public Protection Alert
helpers.getMAPPAAlerts = o =>
  getFirst(withList(o.alerts)
    .filter(oa => (
      !oa.expired &&
      oa.alertType === 'P'
    )));

helpers.getNotForReleaseAlerts = o =>
  getFirst(withList(o.alerts)
    .filter(oa => (
      !oa.expired &&
      oa.alertType === 'X' /*&&
      oa.alertStatus === 'ACTIVE'
      */
    )));

helpers.getAge = o =>
  moment().diff(moment(o.dateOfBirth), 'years');

helpers.getNextOfKin = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.nextOfKin
    ))
    .map(ocp => {
      ocp.primaryAddress = getFirst(withList(ocp.addresses)) || {};

      return ocp;
    }));

helpers.getOffenderManager = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.contactPersonType.contactType === 'O' &&
      ocp.contactPersonType.relationshipType === 'PROB'
    ))
    .map(ocp => {
      ocp.primaryAddress = getFirst(withList(ocp.addresses)) || {};

      return ocp;
    }));

helpers.getCustodyStatus = data => {
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

helpers.getOffenderSentenceCalculationDates = o =>
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

helpers.earliestReleaseDate =  o =>
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

helpers.getNFA = oa => {
  if (~['RELEASE', 'HOME', 'RECEP'].indexOf(oa.addressUsage)) {
    return oa.noFixedAddress ? 'NFA' : undefined;
  }

  return oa.addressUsage;
};

helpers.getCheckHoldAlerts = o =>
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

helpers.isSexOffender = o =>
  withList(o.charges)
    .filter(oc => ~withList(oc.offenceIndicatorCodes).indexOf('S')).length > 0;

helpers.getFirstConviction = o =>
  getLast(withList(o.courtEvents));

helpers.getMostRecentConviction = o =>
  getFirst(withList(o.courtEvents)
    .filter(ce => (
      ce.bookingId === o.mainBooking.bookingId
    )));

helpers.getFirstSentence = o =>
  getFirst(withList(getFirst(withList(
    getLast(withList(o.courtEvents)
      .filter(ce => withList(getFirst(withList(ce.courtEventCharges)).sentences).length > 0))
        .courtEventCharges)).sentences)
          .filter(s => s.isActive));

module.exports = helpers;
