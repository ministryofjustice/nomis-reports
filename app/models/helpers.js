const moment = require('moment');

let helpers = {};

const getFirst = helpers.getFirst = a => a[0] || {};
const getFirstOrNothing = helpers.getFirstOrNothing = a => a[0];
const getLast = helpers.getLast = a => a[a.length - 1] || {};
const withList = helpers.withList = a => a || [];

const getSentenceLengthValues = l => {
  let x = (l || '').split(/\//gmi);

  return {
    years: x[0] ? x[0] : 0,// parseInt(x[0], 10) : 0,
    months: x[1] ? x[1] : 0,// parseInt(x[1], 10) : 0,
    days: x[2] ? x[2] : 0,// parseInt(x[2], 10) : 0,
  };
};

helpers.pipe = p => ({
  apply(x) {
    return p.reduce((x, fn) => {
      try {
        x[fn[0]] = fn[1](x);
      } catch (err) {
        console.log(fn[0], err);
      };
      return x;
    }, Object.assign({}, x));
  }
});

const optionalDate = helpers.optionalDate = d =>
  d ? moment(moment(d).format('YYYY-MM-DDT00:00:00.000Z')) : undefined;

const optionalTime = helpers.optionalTime = d =>
  d ? moment(d).format('HH:mm:ss') : undefined;

helpers.optionalHeight = n => {
  if (n && n > 0) {
    let h = (n / 100).toFixed(2);

    if (h.substr(-3) === '.00') {
      return h.substr(0, h.length - 3);
    }

    if (h.substr(-1) === '0') {
      return h.substr(0, h.length - 1);
    }

    return h;
  }

  return n;
};




// formatters

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

const formatAddressLine1 = helpers.formatAddressLine1 = (a , j) =>
  a && (a.flat || a.premise || a.street) ? [a.flat, a.premise, a.street]
    .filter(x => !!x)
    .join(j ? j : ' ').trim() : undefined;

helpers.formatSupervisingService = om =>
  om && om.primaryAddress
    ? [
        formatAddressLine1(om.primaryAddress, ', '),
        om.primaryAddress.locality,
        (om.primaryAddress.city || {}).description,
        (om.primaryAddress.county || {}).description,
        (om.primaryAddress.country || {}).description,
        om.primaryAddress.postalCode
      ]
      .filter(x => !!x)
      .join(', ') : undefined;

const formatAlert = helpers.formatAlert = oa =>
  oa ? [oa.alertType, (oa.alertCode || {}).code]
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






// filters

helpers.getMainBooking = o =>
  getFirst(withList(o.bookings));

helpers.getPreviousBookings = o =>
  withList(o.bookings)
    .reduce((out, b) => {
      if (b.bookingNo !== o.mainBooking.bookingNo && !~out.indexOf(b.bookingNo)) {
        out.push(b.bookingNo);
      }
      return out;
    }, []);

//TODO: .activeFlag to .isActive or .active?
helpers.getActiveBookings = o =>
  withList(o.bookings)
    .filter(b => b.activeFlag);

helpers.getMainAlias = o =>
  withList(o.aliases)
    .reduce((out, oa) => (
      o.mainBooking &&
      (oa.offenderId === o.mainBooking.offenderId)
        ? oa : out
    ), {
      nomsId: o.nomsId,
      firstName: o.firstName,
      middleNames: o.middleNames,
      surname: o.surname,
      dateOfBirth: o.dateOfBirth,
      ethnicity: o.ethnicity,
      gender: o.gender,
      offenderId: o.offenderId,
    }) || {};

helpers.getEmployment = o =>
  getFirst(withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      (!oe.terminationDate || moment(oe.terminationDate).diff(o.mainBooking.startDate) > 0)
    ))
    .sort((a, b) => a.employmentSequence - b.employmentSequence));

helpers.getOffenderEmployments = o =>
  withList(o.employments)
    .filter(oe => (
      oe.bookingId === o.mainBooking.bookingId &&
      oe.employmentDate &&
      !oe.terminationDate
    ));

helpers.receptionEmployment = o =>
  getLast(o.offenderEmployments);

helpers.dischargeEmployment = o =>
  getFirst(o.offenderEmployments);

//TODO: is endDate relevant to all?
helpers.getOffenderAddresses = o =>
  withList(o.addresses)
    .filter(a => (
      !a.endDate &&
      withList(a.addressUsages).filter(au => au.active).length > 0
    ));

helpers.getOffenderHomeAddress = o =>
  getFirst(withList(o.addresses)
    .filter(a => withList(a.addressUsages)
      .filter(au => (
        au.active &&
        au.usage.code === 'HOME'
      )).length > 0));

helpers.getOffenderReceptionAddress = o =>
  getFirst(withList(o.addresses)
    .filter(a => withList(a.addressUsages)
      .filter(au => (
        au.active &&
        au.usage.code === 'RECEP'
      )).length > 0));

helpers.getOffenderDischargeAddress = o =>
  getFirst(withList(o.addresses)
    .filter(a => withList(a.addressUsages)
      .filter(au => (
        au.active &&
        ~['RELEASE','DNF','DUT','DST','DPH','DSH','DAP','DBA','DOH','DBH'].indexOf(au.usage.code)
      )).length > 0));

helpers.getOffenderDischargeAddress2 = o =>
  getFirst(withList(o.addresses)
    .filter(a => withList(a.addressUsages)
      .filter(au => (
        au.active &&
        !~[ 'HOME', 'RECEP' ].indexOf(au.usage.code)
      )).length > 0));

//TODO: does this have an active property?
helpers.getActiveAlerts = o =>
  withList(o.alerts)
    .filter(oa => (
      oa.bookingId === o.mainBooking.bookingId &&
      oa.alertStatus === 'ACTIVE'
    ));

helpers.getCheckHoldAlerts = o =>
  withList(o.activeAlerts)
    .reduce((x, oa) => {
      let fa = formatAlert(oa);
      switch (fa) {
        case 'T-TG': x.T_TG = fa; break;
        case 'T-TAH': x.T_TAH = fa; break;
        case 'T-TSE': x.T_TSE = fa; break;
        case 'T-TM': x.T_TM = fa; break;
        case 'T-TPR': x.T_TPR = fa; break;
        case 'H-HA': x.H_HA = fa; break;
      }

      if (oa.alertType === 'V') {
        x.VUL = 'Y';

        if (~['V45','VOP','V46','V49G','V49P'].indexOf((oa.alertCode || {}).code)) {
          x.V_45_46 = 'Y';
        }
      }

      if (fa === 'H-HA') {
        x.SH_STS = 'Y';
        x.SH_Date = oa.alertDate;
      }

      return x;
    }, { VUL: 'N', V_45_46: 'N', SH_STS: 'N' });

helpers.getCourtOutcome = o =>
  getFirst(withList(o.courtEvents)
    .filter(ce =>
      ce.bookingId === o.mainBooking.bookingId &&
      ce.directionCode === 'OUT' &&
      ce.caseId
    )
    // TODO: reorder for offloc ignoring time - so remove
    .sort((a, b) => {
      let x = moment(b.startDateTime).set({ hour: 0, minute: 0, second: 0 })
                .diff(moment(a.startDateTime).set({ hour: 0, minute: 0, second: 0 }));

      return x === 0 ? b.eventId - a.eventId : x;
    }));

helpers.mapOffenderIdentifiers = o =>
  withList(o.aliases)
    .reduce((acc, oa) => acc.concat(withList(oa.identifiers)), [])
    .concat(withList(o.identifiers))
    .reduce((acc, oi) => {
      (acc[oi.identifierType] = acc[oi.identifierType] || []).push(oi.identifier);
      return acc;
    }, {});

//TODO: does this also need to be attached to the current active sentence
helpers.getMostRecentConviction = o => {
  let mrc = getFirst(withList(o.courtEvents)
    .filter(ce => (
      ce.bookingId === o.mainBooking.bookingId &&
      (ce.courtEventCharges || []).filter(cec => (cec.sentences ||[]).length > 0).length > 0
    ))
    // TODO: reorder for offloc ignoring time - so remove
    .sort((a, b) => {
      let x = moment(b.startDateTime).set({ hour: 0, minute: 0, second: 0 })
                .diff(moment(a.startDateTime).set({ hour: 0, minute: 0, second: 0 }));

      return x === 0 ? b.eventId - a.eventId : x;
    })
  );

  return mrc.outcomeReasonCode ? mrc : {};
};

helpers.getPhysicals = o => {
  let physicals = getFirst(withList(o.physicals)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    )));

  return {
    profileDetails: withList(physicals.profileDetails)
        .reduce((x, opd) => {
          if (opd.profileCode) {
             x[opd.profileType] = {
              code: opd.profileCode,
              description: opd.profileType === 'YOUTH'
                  ? (opd.profileCode === 'Y' ? 'YP' : 'A')
                  : opd.profileDescription,
            };
          }
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

helpers.getActiveOffenderSentence = o =>
  withList(o.sentences)
    .reduce((out, os) => (
      os.isActive &&
      os.bookingId === o.mainBooking.bookingId &&
      (!out.startDate || moment(os.startDate).diff(out.startDate) < 0)
        ? os : out
    ), {}) || {};

helpers.getOffenderSentenceCalculations = o =>
  getFirstOrNothing(withList(o.sentenceCalculations)
    .filter(sc => (
      sc.bookingId === o.mainBooking.bookingId
    )));

helpers.getOffenderSentenceLength = o =>
  o.offenderSentence &&
  o.offenderSentence.startDate &&
  o.offenderSentenceCalculations &&
  o.offenderSentenceCalculations.effectiveSentenceEndDate
    ? moment(o.offenderSentenceCalculations.effectiveSentenceEndDate)
        .diff(moment(o.offenderSentence.startDate), 'days') + 1 : undefined;

helpers.getOffenderLicenses = o =>
  withList(o.sentences)
    .filter(s => (
      s.bookingId === o.offenderSentence.bookingId &&
      s.sentenceCategory === 'LICENCE' &&
      s.isActive
    ));

  helpers.getFirstSentence = o =>
    getFirst(withList(
      getFirst(withList(
        getLast(withList(o.courtEvents)
          .filter(ce => withList(getFirst(withList(ce.courtEventCharges)).sentences).length > 0)
        ).courtEventCharges
      )).sentences
    ).filter(s => s.isActive));

helpers.getEarliestSentenceAndConviction = o =>
  withList(o.courtEvents)
    .filter(ce => (
      ce.bookingId === o.mainBooking.bookingId &&
      (ce.courtEventCharges || []).filter(cec => (
        (cec.resultCodes || []).filter(rc => rc.conviction).length > 0
      )).length > 0
    ))
    .reduce((out, ce) => {
      if (ce.startDateTime && (!out.earliestConviction.startDateTime || moment(ce.startDateTime).diff(out.earliestConviction.startDateTime) < 0)) {
        out.earliestConviction = ce;
      }

      (ce.courtEventCharges || [])
        .forEach(cec => {
          let activeSentence = (cec.sentences || [])
            .reduce((out, os) => (
              os.isActive && (!out.startDate || moment(os.startDate).diff(out.startDate) < 0)
            ) ? os : out, {});

          if (activeSentence.startDate && (!out.earliestSentence.startDate || moment(activeSentence.startDate).diff(out.earliestSentence.startDate) < 0)) {
            out.earliestSentence = activeSentence;
          }
        });

      return out;
    }, { earliestConviction: {}, earliestSentence: {} });

// movement related

helpers.getLastSequentialTransfer = o =>
  getLast(
    withList(o.movements)
      .filter(oem => (
        oem.bookingId === o.mainBooking.bookingId &&
        oem.movementTypeCode === 'TRN'
      ))
      // TODO: reorder for offloc ignoring date - so remove
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber) // ASC
  );

helpers.getActiveTransfers = o =>
  withList(o.movements)
    .filter(oem => (
      oem.bookingId === o.mainBooking.bookingId &&
      oem.movementTypeCode === 'TRN' &&
      oem.active
    ))
    // TODO: reorder for offloc ignoring date - so remove
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber); // ASC

helpers.getLastSequentialMovement = o =>
  getLast(
    withList(o.movements)
      .filter(oem => (
        oem.bookingId === o.mainBooking.bookingId
      ))
      // TODO: reorder for offloc ignoring date - so remove
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber) // ASC
  );

helpers.getLastSequentialMovementIfTransfer = o => {
  let oem = helpers.getLastSequentialMovement(o);

  return (oem && oem.movementTypeCode === 'TRN' ? oem : {});
};

helpers.getLastSequentialMovementIfOut = o => {
  let oem = helpers.getLastSequentialMovement(o);

  return (oem && oem.movementDirection === 'OUT' ? oem : {});
};

helpers.getEarliestOutMovementDate = o =>
  withList(o.movements)
    .reduce((out, oem) => (
        oem.bookingId === o.mainBooking.bookingId &&
        oem.movementDirection === 'OUT' &&
        (!out.movementDateTime || moment(oem.movementDateTime).diff(out.movementDateTime) < 0)
      ) ? oem : out, {}) || {};









helpers.getFirstConviction = o =>
  getLast(withList(o.courtEvents));

// Multi Agency Public Protection Alert
//TODO: does this have an active property?
helpers.getMAPPAAlerts = o =>
  getFirst(withList(o.alerts)
    .filter(oa => (
      oa.alertType === 'P' &&
      oa.alertStatus === 'ACTIVE'
    )));

//TODO: does this have an active property?
helpers.getNotForReleaseAlerts = o =>
  getFirst(withList(o.alerts)
    .filter(oa => (
      oa.alertType === 'X' &&
      oa.alertStatus === 'ACTIVE'
    )));

helpers.getOffenderCharges = o =>
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

helpers.getMaternityStatus = o =>
  getFirst(withList(o.healthProblems)
    .filter(hp => (
      hp.bookingId === o.mainBooking.bookingId &&
      hp.problemType === 'MATSTAT' &&
      hp.problemStatus === 'ON' &&
    //hp.domain === 'HEALTH_PBLM' &&
      (!hp.endDate || moment(hp.endDate).diff(o.sysdate) > 0)
    )));

helpers.getReleaseDetails = o =>
  withList(o.releaseDetails)
    .filter(ord => (
      ord.bookingId === o.mainBooking.bookingId
    ));

//TODO: does this have an active property?
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

//TODO: does this have an active property?
helpers.getOffenderSecurityCategory2 = o =>
  getFirst(withList(o.assessments)
    .filter(oa => (
      oa.calcSupLevelType === 'Y' &&
      oa.evaluationResultCode === 'APP' &&
      oa.assessStatus === 'A' &&
      oa.assessmentType &&
      oa.assessmentType.assessmentClass === 'TYPE' &&
      oa.assessmentType.assessmentCode === 'CATEGORY'
    )));

helpers.getIEPLevel = o =>
  getFirst(withList(o.ieps)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    ))
    // TODO: reorder for offloc ignoring time - so remove
    .sort((a, b) => {
      let x = moment(b.iepDateTime).set({ hour: 0, minute: 0, second: 0 })
                .diff(moment(a.iepDateTime).set({ hour: 0, minute: 0, second: 0 }));

      return x === 0 ? b.iepLevelSeq - a.iepLevelSeq : x;
    })
    .map(iep => iep.iepLevel));

helpers.getImprisonmentStatus = o =>
  getFirst(withList(o.imprisonmentStatuses)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId
    )));

//TODO: is status relevant?
helpers.getImprisonmentStatus2 = o =>
  getFirst(withList(o.imprisonmentStatuses)
    .filter(op => (
      op.bookingId === o.mainBooking.bookingId &&
      op.latestStatus
    )));

// main booking entire

//TODO: we cannot rely on the Most_Serious_Flag being set correctly
helpers.getHighestRankedOffence = o => {
  let mostSerious = withList(o.offenderCharges)
    .filter(oc => (
      oc.mostSeriousCharge
    ));

  return getFirst(mostSerious.length === 1
      ? mostSerious
      : withList(o.offenderCharges).filter(c => (c.chargeStatus === 'A'))
  );
};

//TODO: does this have an active property?
helpers.getOffenderMainOffence = o =>
  getFirst(withList(o.offenderCharges)
    .filter(oc => (
      oc.chargeStatus === 'A'
    )));

//TODO: what date do we need to use?
helpers.getFirstOffenderOffence = o =>
  withList(o.offenderCharges)
    .reduce((out, oc) => (
      (!out.startDate || moment(oc.startDate).diff(out.startDate) < 0) ? oc : out
    ), {}) || {};

helpers.getOtherOffences = o =>
  withList(o.offenderCharges)
    .filter((oc) => (
      oc.chargeStatus === 'A' &&
      o.highestRankedOffence.offenceCode !== oc.offenceCode
    ));

helpers.getAge = (o, sysdate) =>
  moment(sysdate).diff(moment(o.dateOfBirth), 'years');

helpers.getNextOfKin = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.nextOfKin
    ))
    .map(ocp => {
      ocp.primaryAddress = getFirst(withList(ocp.addresses)
        .filter(a => a.addressType === 'HOME')) || {};

      return ocp;
    }));

helpers.getOffenderManager = o =>
  getFirst(withList(o.offenderContactPersons)
    .filter(ocp => (
      ocp.contactPersonType.contactType === 'O' &&
      ocp.contactPersonType.relationshipType === 'PROB'
    ))
    .map(ocp => {
      ocp.primaryAddress = getFirst(withList(ocp.addresses)
        .filter(a => a.addressType === 'BUS')) || {};

      return ocp;
    }));

helpers.getCustodyStatus = data => {
  let mainBooking = data.mainBooking;

  let stat = {
    statusReason: (mainBooking.statusReason || "").substring(4),
    inTransit: (mainBooking.inOutStatus || "").toUpperCase() === 'TRN',
    isActive: (mainBooking.activeFlag || false),
    bookingSequence: mainBooking.bookingSequence,
    inOutStatus: (mainBooking.inOutStatus || "")
  };

  let a = null;
  if (stat.isActive) a = 'Active';
  else if (!stat.isActive && (~['ESCP', 'UAL', 'UAL_ECL'].indexOf(stat.statusReason) || stat.inTransit)) a = 'Active';
  else if (!stat.isActive && stat.bookingSequence === 1) a = 'INACTIVE';
  else if (!stat.isActive && stat.bookingSequence > 1) a = 'HISTORIC';

  let b = null;
  if (~['ESCP', 'UAL'].indexOf(stat.statusReason)) b = 'UAL';
  else if (stat.statusReason === 'UAL_ECL') b = 'UAL_ECL';
  else if (stat.inTransit) b === 'In Transit';
  else b = stat.inOutStatus.charAt(0).toUpperCase() + stat.inOutStatus.toLowerCase().slice(1);

  return [a, b].join('-');
};

helpers.getOffenderSentenceCalculationDates = o =>
  o.offenderSentenceCalculations ?
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
    }))(o.offenderSentenceCalculations) : undefined;

helpers.getOffenderSentenceCalculationDates2 = o =>
  o.offenderSentenceCalculations ?
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
    }))(o.offenderSentenceCalculations) : undefined;

helpers.getEarliestReleaseDate =  o =>
  o.offenderSentenceCalculationDates ?
    (scd => [
      scd.hdced || moment('2999-12-31'),
      scd.hdcad || moment('2999-12-31'),
      scd.etd || moment('2999-12-31'),
      scd.mtd || moment('2999-12-31'),
      scd.ltd || moment('2999-12-31'),
      scd.crd || moment('2999-12-31'),
      scd.ped || moment('2999-12-31'),
      scd.apd || moment('2999-12-31'),
      scd.npd || moment('2999-12-31'),
      scd.ard || moment('2999-12-31')
    ]
    .sort((a, b) => a.diff(b))[0])(o.offenderSentenceCalculationDates) : undefined;

helpers.getEarliestReleaseDate2 =  o =>
  o.offenderSentenceCalculationDates ?
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
    ]
    .sort((a, b) => a.date.diff(b.date))[0])(o.offenderSentenceCalculationDates) : undefined;

helpers.getNFA = oa => {
  switch (oa.noFixedAddress) {
    case true: return 'NFA';
    default: return undefined;
  }
};

helpers.getDischargeNFA = oa => {
  let au = getFirst(withList(oa.addressUsages)
    .filter(au => ~['DNF','DUT','DST','DPH','DSH','DAP', 'DBA', 'DOH','DBH'].indexOf(au.usage.code)));

  return au.usage ? au.usage.description || au.usage.code : helpers.getNFA(oa);
};

const getSexOffences = helpers.getSexOffences = o =>
  withList(o.charges)
    .filter(oc => (
      oc.bookingId === o.mainBooking.bookingId &&
      ~withList(oc.offenceIndicatorCodes).indexOf('S')
    ));

helpers.isSexOffender = o =>
  getSexOffences(o).length > 0;

helpers.isEmployed = o =>
  withList(o.programmeProfiles)
    .filter(opp => (
        opp.bookingId === o.mainBooking.bookingId &&
        !opp.suspended &&
        opp.courseActivity.outsideWork
    )).length > 0 ||
  withList(o.individualSchedules)
    .filter(ois => (
        ois.bookingId === o.mainBooking.bookingId &&
        ois.eventType === 'TAP' &&
        ~['OPA', 'R2', 'F7'].indexOf(ois.eventSubType) &&
        ois.eventStatus !== 'DEN' &&
        moment(o.sysdate).diff(ois.returnDate) >= 0
    )).length > 0;







helpers.getFirstSentenceAndCounts = o =>
  (o.sentences || [])
    .filter(s => s.bookingId === o.mainBooking.bookingId)
    .reduce((a, b) => ({
      firstSentenced: b.courtDate < a.courtDate ? b.courtDate : a.courtDate || b.courtDate,
      firstActiveSentenceStart: b.isActive && b.startDate < a.startDate ? b.startDate : a.startDate || b.startDate,
      sentences: a.sentences + 1,
      activeSentences: b.isActive ? a.activeSentences + 1 : a.activeSentences,
      activeFineDefaultSentences:
        b.isActive && b.sentenceCalcType === 'A/FINE' ? a.activeFineDefaultSentences + 1 : a.activeFineDefaultSentences,
    }), { sentences: 0, activeSentences: 0, activeFineDefaultSentences: 0}) || {};







helpers.getOffenceGroups = o =>
  withList(o.charges)
    .reduce((x, oc) => {
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

helpers.getCSRALevel = o =>
  getFirst(withList(o.assessments)
    .filter(oa => (
      oa.assessmentType &&
      oa.assessmentType.assessmentClass === 'TYPE' &&
      oa.assessmentType.cellSharingAlertFlag
    )));


helpers.getImprisonmentStatusCategory = ois => {
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

helpers.formatSentenceLength = o => {
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
};const addressBuilder = (out, n, a, phoneType) => {
  out[`address1_f${n}`] = helpers.formatAddressLine1(a);
  out[`address2_f${n + 1}`] = a.locality;

  if (a.city) {
    out[`address3_f${n + 2}`] = a.city.description;
  }

  if (a.county) {
    out[`address4_f${n + 3}`] = a.county.description;
  }

  if (a.country) {
    out[`address5_f${n + 4}`] = a.country.description;
  }

  out[`address6_f${n + 5}`] = a.postalCode;

  let phones = (a.phones || []).filter(p => !phoneType || p.phoneType === phoneType);
  if (phones.length > 0) {
    out[`address7_f${n + 6}`] = phones[0].phoneNo;
  }

  return out;
};

helpers.modelAddress = (base, n, a, phoneType) => {
  if (!base && !a) {
    return;
  }

  let out = Object.assign({}, base);

  return a ? addressBuilder(out, n, a, phoneType) : out;
};

helpers.getEffectiveSentenceLength = o => {
  let x = (o.offenderSentenceCalculations || {}).effectiveSentenceLength || '';

  if (!x) {
    return {};
  }

  x = x.split(/\//gmi);
  return {
    years: parseInt(x[0], 10),
    months: parseInt(x[1], 10),
    days: parseInt(x[2], 10),
  };
};






module.exports = helpers;
