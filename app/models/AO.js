const moment = require('moment');
const helpers = require('./helpers');

const model = helpers.pipe([
  // bookings
  ['mainBooking', helpers.getMainBooking],                                      // bookings
//['previousBookingNos', helpers.getPreviousBookings],                          // bookings
  ['activeBookings', helpers.getActiveBookings],                                // bookings
  ['custodyStatus', helpers.getCustodyStatus],                                  // mainBooking
  // aliases
  ['mainAlias', helpers.getMainAlias],                                          // aliases
  // identifiers
  ['offenderIdentifiers', helpers.mapOffenderIdentifiers],                      // identifiers
  // assessments
  ['offenderSecurityCategory', helpers.getOffenderSecurityCategory],            // assessments
  ['csraLevel', helpers.getCSRALevel],                                          // assessments
  // sentences
  ['firstSentenceAndCounts', helpers.getFirstSentenceAndCounts],                // sentences
  ['offenderSentence', helpers.getActiveOffenderSentence],                      // sentences
  ['offenderLicenses', helpers.getOffenderLicenses],                            // sentences
  // sentenceCalculations
  ['offenderSentenceCalculations', helpers.getOffenderSentenceCalculations],    // sentenceCalculations
  ['offenderSentenceCalculationDates', helpers.getOffenderSentenceCalculationDates],  // offenderSentenceCalculations
//['effectiveSentenceLength', helpers.getEffectiveSentenceLength],              // offenderSentenceCalculations
//['offenderSentenceLength', helpers.getOffenderSentenceLength],                // offenderSentenceCalculations, offenderSentence
//['earliestReleaseDate', helpers.getEarliestReleaseDate],                      // offenderSentenceCalculationDates
  ['earliestReleaseDate', helpers.getEarliestReleaseDate2],                      // offenderSentenceCalculationDates
  // movements
//['activeTransfers', helpers.getActiveTransfers],                              // movements
  ['firstSequentialMovement', helpers.getFirstSequentialMovement],              // movements
  ['lastSequentialMovement', helpers.getLastSequentialMovement],                // movements
//['lastSequentialMovementIfOut', helpers.getLastSequentialMovementIfOut],      // movements
//['lastSequentialTransfer', helpers.getLastSequentialTransfer],                // movements
//['earliestOutMovementDate', helpers.getEarliestOutMovementDate],              // movements
  // employments
//['offenderEmployments', helpers.getOffenderEmployments],                      // employments
//['employment', helpers.getEmployment],                                        // employments
//['dischargeEmployment', helpers.dischargeEmployment],                         // offenderEmployments
//['receptionEmployment', helpers.receptionEmployment],                         // offenderEmployments
  // charges
  ['offenderCharges', helpers.getOffenderCharges],                              // charges
  //['isSexOffender', helpers.isSexOffender],                                   // charges
  ['offenceGroups', helpers.getOffenceGroups],                                  // charges
  ['mainOffence', helpers.getOffenderMainOffence],                              // offenderCharges
//['highestRankedOffence', helpers.getHighestRankedOffence],                    // offenderCharges
//['otherOffences', helpers.getOtherOffences],                                  // offenderCharges
  ['firstOffence', helpers.getFirstOffenderOffence],                            // offenderCharges
  //contactPersons
  ['offenderContactPersons', helpers.getContactPersons],                        // contactPersons
  ['nextOfKin', helpers.getNextOfKin],                                          // offenderContactPersons
  ['offenderManager', helpers.getOffenderManager],                              // offenderContactPersons
  //addresses
  ['offenderAddresses', helpers.getOffenderAddresses],                          // addresses
  ['offenderHomeAddress', helpers.getOffenderHomeAddress],                      // addresses
  ['offenderReceptionAddress', helpers.getOffenderReceptionAddress],            // addresses
//['offenderDischargeAddress', helpers.getOffenderDischargeAddress],            // addresses
  ['offenderDischargeAddress', helpers.getOffenderDischargeAddress2],           // addresses
  // alerts
  ['activeAlerts', helpers.getActiveAlerts],                                    // alerts
//['notForRelease', helpers.getNotForReleaseAlerts],                            // alerts
//['MAPPA', helpers.getMAPPAAlerts],                                            // alerts
  ['checkHoldAlerts', helpers.getCheckHoldAlerts],                              // activeAlerts
  // physicals
  ['physicals', helpers.getPhysicals],                                          // physicals
  // ieps
  ['IEPLevel', helpers.getIEPLevel],                                            // ieps
  // imprisonmentStatuses
  ['offenderImprisonmentStatus', helpers.getImprisonmentStatus],                        // imprisonmentStatuses
  // releaseDetails
//['releaseDetails', helpers.getReleaseDetails],                                // releaseDetails
  // courtEvents
//['mostRecentConviction', helpers.getMostRecentConviction],                    // courtEvents
//['earliestSentenceAndConviction', helpers.getEarliestSentenceAndConviction],  // courtEvents
//['courtOutcome', helpers.getCourtOutcome],                                    // courtEvents
  // healthProblems
  ['maternityStatus', helpers.getMaternityStatus],                              // healthProblems
  // programmeProfiles, individualSchedules
//['offenderEmployed', helpers.isEmployed],                                     // programmeProfiles, individualSchedules
  // diaryDetails
//['futureDiaryDetails', helpers.getFutureDiaryDetails],                        // diaryDetails
  ['rehabilitationDecisionProvider', helpers.getRehabilitationDecisionProvider],// rehabDecisions
]);

module.exports.build = sysdate => data => {
  let o = model.apply(Object.assign({ sysdate }, data));

  return {
//record_number: o.record_number,
    sysdate: o.sysdate,

//offender_booking_q
    nomis_no: o.nomsId,
    booking_no: o.mainBooking.bookingNo,
    offender_book_id: o.mainBooking.bookingId,
    cro_no: o.offenderIdentifiers.CRO,
    pncid_no: o.offenderIdentifiers.PNC,
    dob: moment(o.dateOfBirth),
    age: helpers.getAge(o.mainAlias),
    gender: o.sexCode,
    race: o.raceCode,
    surname: o.surname,
    forename1: o.firstName,
    forename2: o.middleName,
    offenders_active_bookings: o.activeBookings.length,
    living_unit_id: o.mainBooking.livingUnitId,
    agy_loc_id: o.mainBooking.agencyLocationId,
    in_out_status: o.mainBooking.inOutStatus,

//pivoted_profiles_q
    adult_yp: o.physicals.profileDetails.YOUTH,
    nationality_short: o.physicals.profileDetails.NAT,
    religion_short: o.physicals.profileDetails.RELF,
    marital_status_short: o.physicals.profileDetails.MARITAL,

//preferred_pregnancy_q
    maternity: o.maternityStatus && {
      status_short: o.maternityStatus.problemCode,
      ongoing_or_inactive: o.maternityStatus.problemStatus,
    },

//latest_iep_level_q
    iep: o.IEPLevel.iepLevel,

//csra_level
    csra_level: (o.csraLevel.reviewSupLevelType || o.csraLevel.overridedSupLevelType || o.csraLevel.calcSupLevelType),

//latest_created_case_q
    court_code: (o.mainOffence.case && o.mainOffence.case.agencyLocationId),

//pivotted_offender_addresses_q
    home: o.offenderHomeAddress && {
      flat: o.offenderHomeAddress.flat,
      premise: o.offenderHomeAddress.premise,
      street: o.offenderHomeAddress.street,
      locality: o.offenderHomeAddress.locality,
      city: o.offenderHomeAddress.cityCode,
      county: o.offenderHomeAddress.countyCode,
      postal_code: o.offenderHomeAddress.postalCode,
      country: o.offenderHomeAddress.countryCode,
      no_fixed_address: o.offenderHomeAddress.noFixedAddress,
    },

//pivotted_offender_addresses_q
    next_of_kin: o.nextOfKin && {
      flat: (o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.flat),
      premise: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.premise),
      street: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.street),
      locality: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.locality),
      city: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.city),
      county: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.county),
      postal_code: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.postalCode),
      country: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.country),
      no_fixed_address: (  o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.noFixedAddress),
    },

//pivotted_offender_addresses_q
    discharge: o.offenderDischargeAddress && {
      flat: o.offenderDischargeAddress.flat,
      premise: o.offenderDischargeAddress.premise,
      street: o.offenderDischargeAddress.street,
      locality: o.offenderDischargeAddress.locality,
      city: o.offenderDischargeAddress.cityCode,
      county: o.offenderDischargeAddress.countyCode,
      postal_code: o.offenderDischargeAddress.postalCode,
      country: o.offenderDischargeAddress.countryCode,
      no_fixed_address: o.offenderDischargeAddress.noFixedAddress,
      address_type: o.offenderDischargeAddress.addressType,
    },

//pivotted_offender_addresses_q
    reception: o.offenderReceptionAddress && {
      flat: o.offenderReceptionAddress.flat,
      premise: o.offenderReceptionAddress.premise,
      street: o.offenderReceptionAddress.street,
      locality: o.offenderReceptionAddress.locality,
      city: o.offenderReceptionAddress.cityCode,
      county: o.offenderReceptionAddress.countyCode,
      postal_code: o.offenderReceptionAddress.postalCode,
      country: o.offenderReceptionAddress.countryCode,
      no_fixed_address: o.offenderReceptionAddress.noFixedAddress,
    },

//latest_security_assessment_q
    sec_cat: o.offenderSecurityCategory && {
      short: o.offenderSecurityCategory.reviewSupLevelType || 'Z',
      assessment_date: moment(o.offenderSecurityCategory.assessmentDate),
      next_review_date: moment(o.offenderSecurityCategory.nextReviewDate),
    },

//first_conviction_q
    first_convicted: (o.firstOffence.case && o.firstOffence.case.beginDate && moment(o.firstOffence.case.beginDate)),

//first_sentence_and_counts_q
    first_sentenced: moment(o.firstSentenceAndCounts.firstSentenced),
    sentences: o.firstSentenceAndCounts.sentences,
    active_sentences: o.firstSentenceAndCounts.activeSentences,
    active_fine_default_sentences: o.firstSentenceAndCounts.activeFineDefaultSentences,

//imp_status_sentence_release_q
    imprisonment_status_short: o.offenderImprisonmentStatus.imprisonmentStatus,
    sentence_start_to_end_days: moment(o.offenderSentence.startDate).diff(moment(o.offenderSentenceCalculations.effectiveSentenceEndDate), 'years'),
    sentence_length: o.offenderSentenceCalculationDates.effectiveSentenceLength && {
      years: o.offenderSentenceCalculationDates.effectiveSentenceLength.years,
      months: o.offenderSentenceCalculationDates.effectiveSentenceLength.months,
      days: o.offenderSentenceCalculationDates.effectiveSentenceLength.days,
    },
    indefinite_sentence: (o.offenderImprisonmentStatus.bandCode === 1 ? 'Y' : 'N'),
    date_of_release: o.earliestReleaseDate.date,
    release_name_short: o.earliestReleaseDate.label,
    release_name_long: o.earliestReleaseDate.description,
    sed: o.offenderSentenceCalculationDates.sed,
    hdced: o.offenderSentenceCalculationDates.hdced,
    ped: o.offenderSentenceCalculationDates.ped,
    hdcad: o.offenderSentenceCalculationDates.hdcad,
    ersed: o.offenderSentenceCalculationDates.ersed,
    tersed: o.offenderSentenceCalculationDates.tersed,
    apd: o.offenderSentenceCalculationDates.apd,
    rotl: o.offenderSentenceCalculationDates.rotl,
    tariff: o.offenderSentenceCalculationDates.tariff,
    status_rank: o.offenderImprisonmentStatus.statusRank,
    sentence_length_banded: helpers.formatSentenceLength(o),
    imprisonment_status_category: helpers.getImprisonmentStatusCategory(o.offenderImprisonmentStatus),
    judicially_imposed_sentence_length: o.offenderSentenceCalculationDates.judiciallyImposedSentenceLength && {
      years: o.offenderSentenceCalculationDates.judiciallyImposedSentenceLength.years,
      months: o.offenderSentenceCalculationDates.judiciallyImposedSentenceLength.months,
      days: o.offenderSentenceCalculationDates.judiciallyImposedSentenceLength.days,
    },

//first_and_  date_q
    first_movement: o.firstSequentialMovement && {
      date: moment(o.firstSequentialMovement.movementDateTime),
    },

//offender_booking_q
    last_movement: o.lastSequentialMovement && {
      type_code: o.lastSequentialMovement.movementTypeCode,
      reason_code: o.lastSequentialMovement.movementReasonCode,
      direction: o.lastSequentialMovement.movementDirection,
      from_id: o.lastSequentialMovement.fromAgencyLocationId,
      to_id: o.lastSequentialMovement.toAgencyLocationId,
      date: moment(o.lastSequentialMovement.movementDateTime),
    },

//preferred_self_harm_alert_q
    f2052: o.checkHoldAlerts && {
      status: o.checkHoldAlerts.SH_STS,
      start: o.checkHoldAlerts.SH_Date,
    },

//main_offence_q
    main_offence: o.mainOffence && {
      code: o.mainOffence.offenceCode,
      statute_code: o.mainOffence.statuteCode,
    },

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


//rehab_decision_provider_q
    rehab: {
      decision_code: o.rehabilitationDecisionProvider.decision.code,
      decision: o.rehabilitationDecisionProvider.decision.description,
      provider_code: o.rehabilitationDecisionProvider.activeProvider.code,
      provider: o.rehabilitationDecisionProvider.activeProvider.description,
    }

  };
};
