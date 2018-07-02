const moment = require('moment');
const helpers = require('./helpers');

const model = helpers.pipe([
  ['mainBooking', helpers.getMainBooking],
  ['activeBookings', helpers.getActiveBookings],
  ['offenderIdentifiers', helpers.getIdentifiers],
  ['offenderAddresses', helpers.getOffenderAddresses],
  ['offenderCharges', helpers.getOffenderCharges],
  ['offenderContactPersons', helpers.getOffenderContactPersons],
  ['offenderSentence', helpers.getOffenderSentence],
  ['offenderSentenceCalculations', helpers.getOffenderSentenceCalculations],
  ['offenderSentenceCalculationDates', helpers.getOffenderSentenceCalculationDates],
  ['homeAddress', helpers.getOffenderHomeAddress],
  ['receptionAddress', helpers.getOffenderReceptionAddress],
  ['dischargeAddress', helpers.getOffenderDischargeAddress2],
  ['nextOfKin', helpers.getNextOfKin],
  ['securityCategory', helpers.getSecurityCategory2],
  ['csraLevel', helpers.getCSRALevel],
  ['checkHoldAlerts', helpers.getCheckHoldAlerts],
  ['firstSentenceAndCounts', helpers.getFirstSentenceAndCounts],
  ['lastMovement', helpers.getLastOffenderMovement],
  ['firstMovement', helpers.getFirstOffenderMovement],
  ['mainOffence', helpers.getMainOffence],
  ['firstOffence', helpers.getFirstCharge],
  ['offenderImprisonmentStatus', helpers.getImprisonmentStatus2],
  ['releaseDetails', helpers.getReleaseDetails],
  ['earliestReleaseDate', helpers.getEarliestReleaseDate],
  ['physicals', helpers.getPhysicals],
  ['IEPLevel', helpers.getIEPLevel],
  ['offenceGroups', helpers.getOffenceGroups],
  ['maternityStatus', helpers.getMaternityStatus]
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
    next_of_kin_flat: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.flat),
    next_of_kin_premise: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.premise),
    next_of_kin_street: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.street),
    next_of_kin_locality: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.locality),
    next_of_kin_city: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.city),
    next_of_kin_county: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.county),
    next_of_kin_postal_code: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.postalCode),
    next_of_kin_country: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.country),
    next_of_kin_no_fixed_address: (o.nextOfKin && o.nextOfKin.primaryAddress && o.nextOfKin.primaryAddress.noFixedAddress),

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
    sec_cat_assessment_date: moment(o.securityCategory.assessmentDate),
    sec_cat_next_review_date: moment(o.securityCategory.nextReviewDate),

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
    sentence_length_banded: helpers.formatSentenceLength(o),
    imprisonment_status_category: helpers.getImprisonmentStatusCategory(o.offenderImprisonmentStatus),
    jisl_years: o.sentenceCalculationDates.judiciallyImposedSentenceLength.years,
    jisl_months: o.sentenceCalculationDates.judiciallyImposedSentenceLength.months,
    jisl_days: o.sentenceCalculationDates.judiciallyImposedSentenceLength.days,

//first_and_last_movement_date_q
    first_movement_date: moment(o.firstMovement.movementDateTime),

//offender_booking_q
    last_movement_type_code: o.lastMovement.movementTypeCode,
    last_movement_reason_code: o.lastMovement.movementReasonCode,
    last_movement_direction: o.lastMovement.movementDirection,
    last_movement_from_id: o.lastMovement.fromAgencyLocationId,
    last_movement_to_id: o.lastMovement.toAgencyLocationId,
    last_movement_date: moment(o.lastMovement.movementDateTime),

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
};
