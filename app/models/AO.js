const getID = (id) => (o) => (o.identifiers.filter(x => x.identifierType === id) || {}) || {};
const getCRO = getID('CRO');
const getPNC = getID('PNC');

const getAge = (o) => ('' + ((new Date()) - new Date(o.dateOfBirth)) / 1000 / 60 / 60 / 24 / 365).split('.')[0] || 0;

module.exports.build = (o) => {
  let mainBooking = o.bookings[0] || {};
  let activeBookings = o.bookings.filter(b => b.activeFlag).length || 0;
  let homeAddress = o.addresses.filter(a => a.addressUsage === 'HOME')[0] || {};
  let receptionAddress = o.addresses.filter(a => a.addressUsage === 'RECEP')[0] || {};
  let dischargeAddress = o.addresses.filter(a => !~[ 'HOME', 'RECEP' ].indexOf(a.addressUsage))[0] || {};
  let maternity = o.healthProblems.filter(hp => hp.problemType === 'MATSTAT')[0] || {};
  let sec = o.assessments.filter(a =>
    (a.assessmentType.assessmentClass === 'TYPE' && a.assessmentType.assessmentCode === 'CATEGORY' && a.calcSupLevelType === 'Y'
        && a.assessStatus === 'A' && a.evaluationResultCode === 'APP'))[0] || {};
  let csraLevel = o.assessments.filter(a =>
    (a.assessmentType.assessmentClass === 'TYPE' && a.assessmentType.cellSharingAlertFlag))[0] || {};
  //let sha = o.alerts.filter(a => a.alertType === 'H')[0];
  let fsc = o.sentences.filter(s => s.bookingId === mainBooking.offenderBookingId)
    .reduce((a, b) => ({
      firstSentenced: b.courtDate < a.courtDate ? b.courtDate : a.courtDate || b.courtDate,
      firstActiveSentenceStart: b.sentenceStatus === 'A' && b.startDate < a.startDate ? b.startDate : a.startDate || b.startDate,
      sentences: a.sentences + 1,
      activeSentences: b.sentenceStatus === 'A' ? a.activeSentences + 1 : a.activeSentences,
      activeFineDefaultSentences:
        b.sentenceStatus === 'A' && b.sentenceCalcType === 'A/FINE' ? a.activeFineDefaultSentences + 1 : a.activeFineDefaultSentences,
    }), { sentences: 0, activeSentences: 0, activeFineDefaultSentences: 0}) || {};
  let firstMovement = o.movements[0] || {};
  let lastMovement = o.movements[o.movements.length - 1] || {};
  let mainOffence = o.charges.filter(c => (c.bookingId === mainBooking.offenderBookingId && c.chargeStatus === 'A'))[0] || {};
  let firstOffence = o.charges[o.charges.length - 1] || {};

  let model = {
  //record_number: o.record_number,
//offender_booking_q
    nomis_no: o.nomsId,
    booking_no: mainBooking.bookingNo,
    offender_book_id: mainBooking.offenderBookingId,
    cro_no: getCRO(o).identifier,
    pncid_no: getPNC(o).identifier,
    dob: new Date(o.dateOfBirth),
    age: getAge(o),
    gender: o.sexCode,
    race: o.raceCode,
    surname: o.surname,
    forename1: o.firstName,
    forename2: o.middleName,
    offenders_active_bookings: activeBookings,
    living_unit_id: mainBooking.livingUnitId,
    agy_loc_id: mainBooking.agencyLocationId,
    in_out_status: mainBooking.inOutStatus,
                                                                  //establishment_f2
/*
//pivoted_profiles_q
    ppd.adult_yp,                                 -- adult_yp_f11
    ppd.nationality_short,                        -- nationality_f14
    ppd.religion_short,                           -- religion_f16
    ppd.marital_status_short,                     -- marital_f17
*/
//preferred_pregnancy_q
    maternity_status_short: maternity && maternity.problemCode,
    maternity_ongoing_or_inactive: maternity && maternity.problemStatus,
/*
//latest_iep_level_q
    lil.iep_level as iep,                         -- 20	Incentive Level Description
*/
//csra_level
    csra_level: csraLevel && (csraLevel.reviewSupLevelType || csraLevel.overridedSupLevelType || csraLevel.calcSupLevelType),

//latest_created_case_q
    court_code: mainOffence.case.agencyLocationId,

//pivotted_offender_addresses_q
    home_flat: homeAddress.flat,
    home_premise: homeAddress.premise,
    home_street: homeAddress.street,
    home_locality: homeAddress.locality,
    home_city: homeAddress.cityCode,
    home_county: homeAddress.countyCode,
    home_postal_code: homeAddress.postalCode,
    home_country: homeAddress.countryCode,
    home_no_fixed_address: homeAddress.noFixedAddress,

//pivotted_offender_addresses_q
    /*
    -- 101	Nominated NOK
    -- 102	NOK Address Relationship
    na.flat as next_of_kin_flat,                          -- 103	NOK Address Line 1
    na.premise as next_of_kin_premise,                    -- 103	NOK Address Line 1
    na.street as next_of_kin_street,                      -- 104	NOK Address Line 2
    na.locality as next_of_kin_locality,                  -- 105	NOK Address Line 3
    na.city as next_of_kin_city,                          -- 106	NOK Address Line 4
    na.county as next_of_kin_county,                      -- 107	NOK Address Line 5
    na.postal_code as next_of_kin_postal_code,            -- 108	NOK Address Line 6
    na.country as next_of_kin_country,                    -- 109	NOK Address Line 7
    na.no_fixed_address as next_of_kin_no_fixed_address,
    */

//pivotted_offender_addresses_q
    // 78	Discharge Address Relationship
    discharge_flat: dischargeAddress.flat,
    discharge_premise: dischargeAddress.premise,
    discharge_street: dischargeAddress.street,
    discharge_locality: dischargeAddress.locality,
    discharge_city: dischargeAddress.cityCode,
    discharge_county: dischargeAddress.countyCode,
    discharge_postal_code: dischargeAddress.postalCode,
    discharge_country: dischargeAddress.countryCode,
    discharge_no_fixed_address: dischargeAddress.noFixedAddress,
    discharge_address_type: dischargeAddress.addressType,

//pivotted_offender_addresses_q
    // 86	Reception Address Relationship
    reception_flat: receptionAddress.flat,
    reception_premise: receptionAddress.premise,
    reception_street: receptionAddress.street,
    reception_locality: receptionAddress.locality,
    reception_city: receptionAddress.cityCode,
    reception_county: receptionAddress.countyCode,
    reception_postal_code: receptionAddress.postalCode,
    reception_country: receptionAddress.countryCode,
    reception_no_fixed_address: receptionAddress.noFixedAddress,

//latest_security_assessment_q
    sec_cat_short: sec.reviewSupLevelType || 'Z',
    sec_cat_assessment_date: new Date(sec.assessmentDate),
    sec_cat_next_review_date: new Date(sec.nextReviewDate),


//first_conviction_q
    first_convicted: (firstOffence.case && firstOffence.case.beginDate && new Date(firstOffence.case.beginDate)),

//first_sentence_and_counts_q
    first_sentenced: new Date(fsc.firstSentenced),
    sentences: fsc.sentences || 0,
    active_sentences: fsc.activeSentences || 0,
    active_fine_default_sentences: fsc.activeFineDefaultSentences || 0,
/*
//imp_status_sentence_release_q
    issr.imprisonment_status as imprisonment_status_short,    -- 24	Custody Status
    issr.effective_sentence_end_date - fsc.first_active_sentence_start + 1 as sentence_start_to_end_days, -- 64	Effective Sentence Length
    issr.sentence_length_years,                           -- 28	Sentence Length (Years)
    issr.sentence_length_months,                          -- 29	Sentence Length (Months)
    issr.sentence_length_days,                            -- 30	Sentence Length (Days)
    issr.indefinite_sentence,
    issr.date_of_release as date_of_release,              -- 32	Earliest Release Date
    issr.release_name_short,
    issr.sed_date as sed,                                 -- 67	SED
    issr.hdced_date as hdced,                             -- 68	HDCED
    issr.ped_date as ped,                                 -- 70	PED
    issr.hdcad_overrided_date as hdcad_overridden_date,   -- 69	HDCAD
    issr.ersed_overrided_date as ersed_overridden_date,
    issr.tersed_overrided_date as tersed_overridden_date,
    issr.apd_overrided_date as apd_overridden_date,
    issr.rotl_overrided_date as rotl_overridden_date,
    issr.tariff_overrided_date as tariff_overridden_date,
    issr.status_rank,
    issr.sentence_length_banded,
    coalesce(issr.imprisonment_status_category, 'Unknown') as imprisonment_status_category,
    issr.jisl_years,
    issr.jisl_months,
    issr.jisl_days,
*/
//first_and_last_movement_date_q
    first_movement_date: new Date(firstMovement.movementDateTime),

//offender_booking_q
    last_movement_type_code: lastMovement.movementTypeCode,
    last_movement_reason_code: lastMovement.movementReasonCode,
    last_movement_direction: lastMovement.movementDirection,
    last_movement_from_id: lastMovement.fromAgencyLocationId,
    last_movement_to_id: lastMovement.toAgencyCodeLocationId,
    last_movement_date: new Date(lastMovement.movementDateTime),

/*
//preferred_self_harm_alert_q
    sha.f2052_status,                                   -- 76	ACCT (Self Harm) Status -- 42	ACCT Status (F2052)
    sha.f2052_start as f2052_start,                     -- 77  ACCT (Self Harm) Start Date
*/

//main_offence_q
    main_offence_code: mainOffence.offenceCode,
    main_offence_statute_code: mainOffence.statuteCode,

/*
//offence_groups_q
    coalesce(og.drug_offences, 'N') as drug_offences,
    coalesce(og.harassment_offences, 'N') as harassment_offences,
    coalesce(og.racially_aggravated, 'N') as racially_aggravated,
    coalesce(og.religiously_aggravated, 'N') as religiously_aggravated,
    coalesce(og.sexual, 'N') as sexual,
    coalesce(og.risk_to_children, 'N') as risk_to_children,
    coalesce(og.sex_offender_register, 'N') as sex_offender_register,   -- 52	Sex Offender
    coalesce(og.violent, 'N') as violent,
    coalesce(og.victim_offences, 'N') as victim_offences,
*/
/*
//rehab_decision_provider_q
    r.decision_code as rehab_decision_code,
    r.decision as rehab_decision,
    r.provider_code as rehab_provider_code,
    r.provider as rehab_provider,
*/
  };

  return model;
}
