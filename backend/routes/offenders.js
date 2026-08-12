const express = require('express');
const sql = require('../db');
const { uploadPhoto } = require('../storage');

const router = express.Router();

// Every route below takes an offender :id. Load it once here and refuse
// access if the offender belongs to a different facility than the
// requesting user's — mirrors the facilityId filter already used on the
// list route, but for by-id access where a route param can name any
// offender regardless of who's asking.
router.param('id', async (req, res, next, id) => {
  const [offender] = await sql`SELECT id, facility_id FROM offenders WHERE id = ${id}`;
  if (!offender) return res.status(404).json({ error: 'Offender not found' });

  const facilityId = req.user && req.user.facility_id;
  if (facilityId && offender.facility_id !== facilityId) {
    return res.status(404).json({ error: 'Offender not found' });
  }

  req.offender = offender;
  next();
});

const OFFENDER_COLUMNS = `
  o.id, o.name, o.admission_date, o.status, o.next_action,
  o.id_number, o.next_of_kin_name, o.next_of_kin_contact, o.warrant_type,
  o.nickname, o.registration_number, o.religion, o.race, o.nationality, o.marital_status,
  o.address_street, o.address_town, o.address_province,
  o.sentence_status, o.passport_number, o.denomination, o.gender, o.place_of_birth,
  o.date_of_birth, o.number_of_dependants, o.postal_code,
  o.next_of_kin_relationship, o.next_of_kin_town, o.next_of_kin_province, o.next_of_kin_postal_code,
  o.body_receipt_id, o.photo_url,
  f.id AS facility_id, f.name AS facility_name
`;

router.get('/', async (req, res) => {
  const facilityId = req.user && req.user.facility_id;
  const offenders = await sql`
    SELECT ${sql.unsafe(OFFENDER_COLUMNS)}
    FROM offenders o
    JOIN facilities f ON f.id = o.facility_id
    ${facilityId ? sql`WHERE o.facility_id = ${facilityId}` : sql``}
    ORDER BY o.id
  `;
  res.json(offenders);
});

router.get('/:id', async (req, res) => {
  const [offender] = await sql`
    SELECT ${sql.unsafe(OFFENDER_COLUMNS)}
    FROM offenders o
    JOIN facilities f ON f.id = o.facility_id
    WHERE o.id = ${req.params.id}
  `;
  if (!offender) return res.status(404).json({ error: 'Offender not found' });

  const [health] = await sql`SELECT * FROM health_records WHERE offender_id = ${req.params.id}`;
  const incidents = await sql`SELECT * FROM incidents WHERE offender_id = ${req.params.id} ORDER BY timestamp DESC`;

  res.json({ ...offender, health: health || null, incidents });
});

router.get('/:id/profile', async (req, res) => {
  const [offender] = await sql`
    SELECT ${sql.unsafe(OFFENDER_COLUMNS)}
    FROM offenders o
    JOIN facilities f ON f.id = o.facility_id
    WHERE o.id = ${req.params.id}
  `;
  if (!offender) return res.status(404).json({ error: 'Offender not found' });

  const id = req.params.id;
  const [
    [health],
    education,
    incidents,
    caseNotes,
    riskAssessments,
    courtCases,
    criminalHistory,
    paroleRecords,
    [nutrition],
    [spiritual],
    screenings,
    [gang],
    personalProperty,
    warrants,
    healthAssessments,
    sectionAAssessments,
    sectionBAssessments,
    sectionCAssessments,
    sectionDAssessments,
    csPlans,
    releases,
    photos
  ] = await Promise.all([
    sql`SELECT * FROM health_records WHERE offender_id = ${id}`,
    sql`SELECT * FROM education_records WHERE offender_id = ${id} ORDER BY id`,
    sql`SELECT * FROM incidents WHERE offender_id = ${id} ORDER BY timestamp DESC`,
    sql`SELECT * FROM case_notes WHERE offender_id = ${id} ORDER BY created_at DESC`,
    sql`SELECT * FROM risk_assessments WHERE offender_id = ${id} ORDER BY assessment_date DESC`,
    sql`SELECT * FROM court_cases WHERE offender_id = ${id} ORDER BY next_court_date`,
    sql`SELECT * FROM criminal_history WHERE offender_id = ${id} ORDER BY date DESC`,
    sql`SELECT * FROM parole_records WHERE offender_id = ${id} ORDER BY hearing_date DESC`,
    sql`SELECT * FROM nutrition_records WHERE offender_id = ${id}`,
    sql`SELECT * FROM spiritual_records WHERE offender_id = ${id}`,
    sql`SELECT * FROM screening_records WHERE offender_id = ${id} ORDER BY date_screened DESC`,
    sql`SELECT * FROM gang_affiliations WHERE offender_id = ${id}`,
    sql`SELECT * FROM personal_property WHERE offender_id = ${id} ORDER BY id`,
    sql`SELECT * FROM warrants WHERE offender_id = ${id} ORDER BY created_at DESC`,
    sql`SELECT * FROM admission_health_assessments WHERE offender_id = ${id} ORDER BY assessment_date DESC`,
    sql`SELECT * FROM section_a_assessments WHERE offender_id = ${id} ORDER BY assessment_date DESC`,
    sql`SELECT * FROM section_b_assessments WHERE offender_id = ${id} ORDER BY assessment_date DESC`,
    sql`SELECT * FROM section_c_assessments WHERE offender_id = ${id} ORDER BY assessment_date DESC`,
    sql`SELECT * FROM section_d_assessments WHERE offender_id = ${id} ORDER BY assessment_date DESC`,
    sql`SELECT * FROM correctional_sentence_plans WHERE offender_id = ${id} ORDER BY plan_date DESC`,
    sql`SELECT * FROM releases WHERE offender_id = ${id} ORDER BY release_date DESC`,
    sql`SELECT * FROM offender_photos WHERE offender_id = ${id} ORDER BY created_at DESC`
  ]);

  const correctionalSentencePlans = await Promise.all(
    csPlans.map(async (plan) => ({
      ...plan,
      items: await sql`SELECT * FROM correctional_sentence_plan_items WHERE plan_id = ${plan.id} ORDER BY id`
    }))
  );

  res.json({
    ...offender,
    health: health || null,
    education,
    incidents,
    case_notes: caseNotes,
    risk_assessments: riskAssessments,
    court_cases: courtCases,
    criminal_history: criminalHistory,
    parole_records: paroleRecords,
    nutrition: nutrition || null,
    spiritual: spiritual || null,
    screenings,
    gang: gang || null,
    personal_property: personalProperty,
    warrants,
    health_assessments: healthAssessments,
    section_a_assessments: sectionAAssessments,
    section_b_assessments: sectionBAssessments,
    section_c_assessments: sectionCAssessments,
    section_d_assessments: sectionDAssessments,
    correctional_sentence_plans: correctionalSentencePlans,
    releases,
    photos
  });
});

router.post('/', async (req, res) => {
  const {
    name, facility_id, admission_date, status, next_action, id_number,
    next_of_kin_name, next_of_kin_contact, warrant_type,
    nickname, registration_number, religion, race, nationality, marital_status,
    address_street, address_town, address_province,
    sentence_status, passport_number, denomination, gender, place_of_birth,
    date_of_birth, number_of_dependants, postal_code,
    next_of_kin_relationship, next_of_kin_town, next_of_kin_province, next_of_kin_postal_code,
    body_receipt_id, photo
  } = req.body;
  if (!name || !facility_id || !admission_date || !status) {
    return res.status(400).json({ error: 'name, facility_id, admission_date, status are required' });
  }

  const row = {
    name, facility_id, admission_date, status,
    next_action: next_action || null,
    id_number: id_number || null,
    next_of_kin_name: next_of_kin_name || null,
    next_of_kin_contact: next_of_kin_contact || null,
    warrant_type: warrant_type || null,
    nickname: nickname || null,
    registration_number: registration_number || null,
    religion: religion || null,
    race: race || null,
    nationality: nationality || null,
    marital_status: marital_status || null,
    address_street: address_street || null,
    address_town: address_town || null,
    address_province: address_province || null,
    sentence_status: sentence_status || null,
    passport_number: passport_number || null,
    denomination: denomination || null,
    gender: gender || null,
    place_of_birth: place_of_birth || null,
    date_of_birth: date_of_birth || null,
    number_of_dependants: number_of_dependants || null,
    postal_code: postal_code || null,
    next_of_kin_relationship: next_of_kin_relationship || null,
    next_of_kin_town: next_of_kin_town || null,
    next_of_kin_province: next_of_kin_province || null,
    next_of_kin_postal_code: next_of_kin_postal_code || null,
    body_receipt_id: body_receipt_id || null
  };

  const [created] = await sql`INSERT INTO offenders ${sql(row)} RETURNING id`;

  let photo_url = null;
  if (photo) {
    photo_url = await uploadPhoto('offenders', created.id, photo);
    await sql`UPDATE offenders SET photo_url = ${photo_url} WHERE id = ${created.id}`;
  }

  res.status(201).json({ id: created.id, photo_url });
});

router.put('/:id', async (req, res) => {
  const [existing] = await sql`SELECT * FROM offenders WHERE id = ${req.params.id}`;
  if (!existing) return res.status(404).json({ error: 'Offender not found' });

  const {
    name, facility_id, admission_date, status, next_action, id_number,
    next_of_kin_name, next_of_kin_contact, warrant_type,
    nickname, registration_number, religion, race, nationality, marital_status,
    address_street, address_town, address_province,
    sentence_status, passport_number, denomination, gender, place_of_birth,
    date_of_birth, number_of_dependants, postal_code,
    next_of_kin_relationship, next_of_kin_town, next_of_kin_province, next_of_kin_postal_code,
    body_receipt_id, photo
  } = req.body;

  const photo_url = photo ? await uploadPhoto('offenders', req.params.id, photo) : existing.photo_url;

  const row = {
    name: name ?? existing.name,
    facility_id: facility_id ?? existing.facility_id,
    admission_date: admission_date ?? existing.admission_date,
    status: status ?? existing.status,
    next_action: next_action ?? existing.next_action,
    id_number: id_number ?? existing.id_number,
    next_of_kin_name: next_of_kin_name ?? existing.next_of_kin_name,
    next_of_kin_contact: next_of_kin_contact ?? existing.next_of_kin_contact,
    warrant_type: warrant_type ?? existing.warrant_type,
    nickname: nickname ?? existing.nickname,
    registration_number: registration_number ?? existing.registration_number,
    religion: religion ?? existing.religion,
    race: race ?? existing.race,
    nationality: nationality ?? existing.nationality,
    marital_status: marital_status ?? existing.marital_status,
    address_street: address_street ?? existing.address_street,
    address_town: address_town ?? existing.address_town,
    address_province: address_province ?? existing.address_province,
    sentence_status: sentence_status ?? existing.sentence_status,
    passport_number: passport_number ?? existing.passport_number,
    denomination: denomination ?? existing.denomination,
    gender: gender ?? existing.gender,
    place_of_birth: place_of_birth ?? existing.place_of_birth,
    date_of_birth: date_of_birth ?? existing.date_of_birth,
    number_of_dependants: number_of_dependants ?? existing.number_of_dependants,
    postal_code: postal_code ?? existing.postal_code,
    next_of_kin_relationship: next_of_kin_relationship ?? existing.next_of_kin_relationship,
    next_of_kin_town: next_of_kin_town ?? existing.next_of_kin_town,
    next_of_kin_province: next_of_kin_province ?? existing.next_of_kin_province,
    next_of_kin_postal_code: next_of_kin_postal_code ?? existing.next_of_kin_postal_code,
    body_receipt_id: body_receipt_id ?? existing.body_receipt_id,
    photo_url
  };

  await sql`UPDATE offenders SET ${sql(row)} WHERE id = ${req.params.id}`;
  res.json({ updated: true });
});

router.post('/:id/photos', async (req, res) => {
  const { kind, photo, note } = req.body;
  if (!photo) return res.status(400).json({ error: 'photo is required' });
  if (kind !== 'mugshot' && kind !== 'evidence') {
    return res.status(400).json({ error: "kind must be 'mugshot' or 'evidence'" });
  }

  const photo_url = await uploadPhoto('offenders', req.params.id, photo);

  const [created] = await sql`
    INSERT INTO offender_photos ${sql({ offender_id: req.params.id, kind, photo_url, note: note || null })}
    RETURNING *
  `;

  if (kind === 'mugshot') {
    await sql`UPDATE offenders SET photo_url = ${photo_url} WHERE id = ${req.params.id}`;
  }

  res.status(201).json(created);
});

router.post('/:id/screenings', async (req, res) => {
  const { screening_type, date_screened, signs_symptoms, lab_test, lab_result, cd4_count, j138_case, referred_to } = req.body;
  if (!screening_type || !date_screened) {
    return res.status(400).json({ error: 'screening_type and date_screened are required' });
  }

  const row = {
    offender_id: req.params.id,
    screening_type,
    date_screened,
    signs_symptoms: signs_symptoms || null,
    lab_test: lab_test || null,
    lab_result: lab_result || null,
    cd4_count: cd4_count || null,
    j138_case: j138_case ? 1 : 0,
    referred_to: referred_to || null
  };
  const [created] = await sql`INSERT INTO screening_records ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

router.put('/:id/gang', async (req, res) => {
  const { prison_gang, prison_gang_rank, street_gang, street_gang_rank } = req.body;
  const row = {
    offender_id: req.params.id,
    prison_gang: prison_gang || null,
    prison_gang_rank: prison_gang_rank || null,
    street_gang: street_gang || null,
    street_gang_rank: street_gang_rank || null
  };

  await sql`
    INSERT INTO gang_affiliations ${sql(row)}
    ON CONFLICT (offender_id) DO UPDATE SET
      prison_gang = excluded.prison_gang,
      prison_gang_rank = excluded.prison_gang_rank,
      street_gang = excluded.street_gang,
      street_gang_rank = excluded.street_gang_rank
  `;

  const [updated] = await sql`SELECT * FROM gang_affiliations WHERE offender_id = ${req.params.id}`;
  res.json(updated);
});

router.post('/:id/property', async (req, res) => {
  const { item_description, condition, estimated_value, bag_number } = req.body;
  if (!item_description || !condition) {
    return res.status(400).json({ error: 'item_description and condition are required' });
  }

  const row = {
    offender_id: req.params.id,
    item_description,
    condition,
    estimated_value: estimated_value || null,
    bag_number: bag_number || null
  };
  const [created] = await sql`INSERT INTO personal_property ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const WARRANT_FIELDS = [
  'police_station', 'district_regional_division', 'provincial_local_division',
  'cas_no', 'court_case_number', 'cr_number', 'docket_number', 'fingerprint_no',
  'date_of_arrest', 'investigating_officer', 'investigating_officer_contact',
  'prosecutor', 'legal_representative', 'correctional_centre', 'type_of_detention',
  'charges', 'custody_until_date', 'court', 'type_of_court', 'bail_particulars', 'bail_amount',
  'hospital', 'doctor', 'enquiry_length_days', 'act_section', 'report_submission_date',
  'home_address', 'telephone_home', 'telephone_work', 'date_of_sentence', 'offence', 'sentence',
  'sentence_period_from', 'sentence_period_to', 'sentence_length', 'parole_violation',
  'violation_length', 'date_warrant_served', 'community_corrections', 'head_of_community_corrections',
  'number_of_warrants', 'charged_with', 'date_offence_committed', 'date_of_conviction', 'classification_of_fine',
  'clerk_of_court', 'dcs_case_number', 'date_remanded_to', 'sentence_category',
  'head_of_correctional_centre', 'warrant_status', 'judgment',
  'warrant_dated', 'by_reason_of', 'given_under_hand_at', 'date_of_liberation'
];

router.post('/:id/warrants', async (req, res) => {
  const { warrant_category, warrant_type } = req.body;
  if (!warrant_category || !warrant_type) {
    return res.status(400).json({ error: 'warrant_category and warrant_type are required' });
  }

  const row = {
    offender_id: req.params.id,
    warrant_category,
    warrant_type,
    ...Object.fromEntries(WARRANT_FIELDS.map((field) => [field, req.body[field] || null])),
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO warrants ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const HEALTH_ASSESSMENT_FIELDS = [
  'assessed_by', 'allergies', 'behavioural_observation',
  'illness_needs_treatment', 'illness_specify',
  'injuries_needs_attention', 'injuries_specify',
  'medication_in_possession', 'medication_specify',
  'recent_operation', 'recent_operation_specify',
  'scheduled_appointments', 'scheduled_appointments_specify',
  'medic_alert', 'medic_alert_specify',
  'disabilities', 'disabilities_specify',
  'prostheses', 'prostheses_specify',
  'last_meal',
  'hygiene_acceptable', 'hygiene_specify',
  'additional_comments'
];

router.post('/:id/health-assessments', async (req, res) => {
  const { assessment_date } = req.body;
  if (!assessment_date) {
    return res.status(400).json({ error: 'assessment_date is required' });
  }

  const row = {
    offender_id: req.params.id,
    assessment_date,
    ...Object.fromEntries(HEALTH_ASSESSMENT_FIELDS.map((field) => [field, req.body[field] || null])),
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO admission_health_assessments ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const SECTION_A_CHECKBOX_FIELDS = [
  'child_placed_reformatory', 'child_placed_secure_care', 'child_placed_court_programme',
  'youth_victim_women', 'youth_victim_men', 'youth_victim_girls', 'youth_victim_boys',
  'youth_victim_aged', 'youth_victim_animals', 'youth_victim_disabled', 'youth_victim_children', 'youth_victim_business',
  'youth_harm_death', 'youth_harm_serious', 'youth_harm_minor',
  'youth_weapon_none', 'youth_weapon_firearm', 'youth_weapon_knife', 'youth_weapon_explosives',
  'adult_harm_death', 'adult_harm_serious', 'adult_harm_minor',
  'adult_weapon_none', 'adult_weapon_firearm', 'adult_weapon_knife', 'adult_weapon_explosives',
  'offence_murder', 'offence_culpable_homicide', 'offence_assault', 'offence_sexual', 'offence_robbery',
  'offence_theft', 'offence_fraud', 'offence_drug_alcohol', 'offence_firearm_ammo', 'offence_weapons_explosives',
  'offence_property_damage', 'offence_public_order', 'offence_road_traffic', 'offence_justice_govt',
  'offence_trafficking', 'offence_freedom_movement', 'offence_misc',
  'current_harm_death', 'current_harm_serious', 'current_harm_minor',
  'current_weapon_none', 'current_weapon_firearm', 'current_weapon_knife', 'current_weapon_explosives',
  'motive_financial', 'motive_thrill_seeking', 'motive_addiction', 'motive_sexual', 'motive_revenge',
  'motive_anger_aggression', 'motive_hate', 'motive_provocation', 'motive_political', 'motive_racial',
  'motive_emotional', 'motive_other',
  'influence_alcohol', 'influence_dagga', 'influence_drugs',
  'addicted_alcohol', 'addicted_dagga', 'addicted_mandrax', 'addicted_tik', 'addicted_heroine',
  'addicted_cocaine', 'addicted_ecstasy', 'addicted_crack', 'addicted_glue', 'addicted_prescriptive',
  'gang_assoc_family', 'gang_assoc_friends', 'gang_assoc_correctional', 'gang_assoc_community',
  'gang_assoc_antisocial_peers', 'gang_assoc_cult', 'gang_assoc_political', 'gang_assoc_mafia',
  'gang_assoc_organized_crime', 'gang_assoc_criminal_peers'
];

const SECTION_A_NUMERIC_FIELDS = [
  'adult_victim_women', 'adult_victim_men', 'adult_victim_girls', 'adult_victim_boys', 'adult_victim_aged',
  'adult_victim_animals', 'adult_victim_disabled', 'adult_victim_children', 'adult_victim_business',
  'current_victim_women', 'current_victim_men', 'current_victim_girls', 'current_victim_boys', 'current_victim_aged',
  'current_victim_animals', 'current_victim_disabled', 'current_victim_children', 'current_victim_business',
  'substance_start_age'
];

const SECTION_A_TEXT_FIELDS = [
  'assessed_by',
  'child_convicted', 'child_crimes', 'child_sanctions', 'child_placed_programme',
  'child_reformatory_reasons', 'child_secure_care_reasons', 'child_court_programme_reasons',
  'child_special_school', 'child_suspended', 'child_suspended_reasons', 'child_expelled', 'child_expelled_reasons',
  'youth_convicted', 'youth_crimes', 'youth_sanctions', 'youth_victim_other',
  'youth_victim_known', 'youth_victim_stranger', 'youth_harm_other', 'youth_weapon_other',
  'adult_convicted', 'adult_crimes', 'adult_sanctions', 'adult_victim_other',
  'adult_victim_known', 'adult_victim_stranger', 'adult_harm_other', 'adult_weapon_other',
  'offence_other', 'current_victim_other', 'current_victim_known', 'current_victim_stranger',
  'current_harm_other', 'current_weapon_other',
  'crime_under_influence', 'influence_drugs_specify', 'addicted_to_substances', 'addicted_other',
  'substance_treatment_received',
  'gang_member', 'gang_assoc_other', 'crime_committed_in_group', 'gang_role', 'gang_mission',
  'gang_mission_other', 'relatives_involved_in_crime'
];

router.post('/:id/section-a-assessments', async (req, res) => {
  const { assessment_date } = req.body;
  if (!assessment_date) {
    return res.status(400).json({ error: 'assessment_date is required' });
  }

  const row = {
    offender_id: req.params.id,
    assessment_date,
    ...Object.fromEntries(SECTION_A_TEXT_FIELDS.map((field) => [field, req.body[field] || null])),
    ...Object.fromEntries(SECTION_A_NUMERIC_FIELDS.map((field) => [field, req.body[field] || 0])),
    ...Object.fromEntries(SECTION_A_CHECKBOX_FIELDS.map((field) => [field, req.body[field] ? 1 : 0])),
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO section_a_assessments ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const SECTION_B_FIELDS = [
  'assessed_by',
  'can_read_write', 'highest_grade_category', 'qualification_year',
  'trained_profession', 'trained_profession_specify', 'practical_experience_years',
  'qualified_registered', 'qualified_registered_specify',
  'tertiary_education', 'tertiary_qualification', 'tertiary_field_of_study', 'tertiary_year_obtained',
  'currently_studying', 'currently_studying_specify',
  'education_training_needs', 'education_training_needs_specify',
  'has_skills_hobbies', 'skills_hobbies_specify',
  'competitive_sport', 'competitive_sport_specify',
  'sport_recreation_training', 'sport_recreation_training_specify',
  'arts_cultural_training', 'arts_cultural_training_specify',
  'employed_before_incarceration', 'employment_type'
];

router.post('/:id/section-b-assessments', async (req, res) => {
  const { assessment_date } = req.body;
  if (!assessment_date) {
    return res.status(400).json({ error: 'assessment_date is required' });
  }

  const row = {
    offender_id: req.params.id,
    assessment_date,
    ...Object.fromEntries(SECTION_B_FIELDS.map((field) => [field, req.body[field] || null])),
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO section_b_assessments ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const SECTION_C_CHECKBOX_FIELDS = [
  'support_religious_services', 'support_baptism', 'support_counselling',
  'support_spiritual_visits', 'support_marriage_counselling', 'support_consultation',
  'significant_spouse', 'significant_parents', 'significant_grandparents', 'significant_siblings',
  'significant_uncle', 'significant_aunt', 'significant_own_children', 'significant_in_laws', 'significant_friends',
  'contact_visits', 'contact_telephone', 'contact_letters', 'contact_none',
  'prev_sex_rape', 'prev_sex_attempted_rape', 'prev_sex_sexual_assault', 'prev_sex_statutory_rape',
  'prev_sex_indecent_assault', 'prev_sex_sodomy',
  'current_sex_rape', 'current_sex_attempted_rape', 'current_sex_sexual_assault', 'current_sex_statutory_rape',
  'current_sex_indecent_assault', 'current_sex_sodomy'
];

const SECTION_C_NUMERIC_FIELDS = ['num_adult_dependants', 'num_child_dependants'];

const SECTION_C_TEXT_FIELDS = [
  'assessed_by',
  'faith_member', 'faith_member_specify', 'faith_role', 'faith_active_before', 'faith_active_before_specify',
  'needs_spiritual_support', 'support_other', 'wants_religious_participation',
  'staying_with_at_arrest', 'significant_other',
  'accommodation_type', 'accommodation_other_specify', 'neighbourhood_type', 'neighbourhood_other_specify',
  'contact_other', 'wants_contact_established', 'relationship_problems', 'relationship_problems_specify',
  'has_dependants', 'dependants_related', 'dependant_name', 'dependant_relationship', 'dependant_age',
  'responsible_child_maintenance', 'sole_provider', 'dependants_need_social_assistance',
  'mental_illness_treatment', 'mental_illness_treatment_date', 'currently_on_mental_treatment',
  'suicide_self_harm_treated', 'suicide_self_harm_specify', 'suicidal_thoughts_now', 'flashbacks_nightmares',
  'convicted_sexual_offence_ever', 'prev_sex_other',
  'current_conviction_sexual_offence', 'current_sex_other',
  'victim_before_imprisonment', 'victim_before_imprisonment_specify',
  'abused_since_admission', 'abused_reported_incident',
  'court_recommended_treatment', 'court_recommended_treatment_specify'
];

router.post('/:id/section-c-assessments', async (req, res) => {
  const { assessment_date } = req.body;
  if (!assessment_date) {
    return res.status(400).json({ error: 'assessment_date is required' });
  }

  const row = {
    offender_id: req.params.id,
    assessment_date,
    ...Object.fromEntries(SECTION_C_TEXT_FIELDS.map((field) => [field, req.body[field] || null])),
    ...Object.fromEntries(SECTION_C_NUMERIC_FIELDS.map((field) => [field, req.body[field] || 0])),
    ...Object.fromEntries(SECTION_C_CHECKBOX_FIELDS.map((field) => [field, req.body[field] ? 1 : 0])),
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO section_c_assessments ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const SECTION_D_CHECKBOX_FIELDS = [
  'escaped', 'attempted_escape', 'aided_escape', 'escape_none',
  'probation_revoked', 'breached_parole', 'breached_bail', 'absconded'
];
const SECTION_D_TEXT_FIELDS = [
  'assessed_by',
  'previous_crime_category', 'current_crime_category', 'serving_multiple_sentences',
  'institutional_offences',
  'convicted_racial_political_offence', 'convicted_racial_political_offence_specify',
  'further_charges', 'further_charges_specify',
  'threatened_since_admission', 'threatened_since_admission_specify'
];

router.post('/:id/section-d-assessments', async (req, res) => {
  const { assessment_date } = req.body;
  if (!assessment_date) {
    return res.status(400).json({ error: 'assessment_date is required' });
  }

  const row = {
    offender_id: req.params.id,
    assessment_date,
    ...Object.fromEntries(SECTION_D_TEXT_FIELDS.map((field) => [field, req.body[field] || null])),
    ...Object.fromEntries(SECTION_D_CHECKBOX_FIELDS.map((field) => [field, req.body[field] ? 1 : 0])),
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO section_d_assessments ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

const CSP_ITEM_FIELDS = [
  'category', 'identified_risk_need', 'identified_risk_need_other_specify',
  'programme', 'programme_other_specify', 'service_provider', 'timeframe'
];

router.post('/:id/correctional-sentence-plans', async (req, res) => {
  const { plan_date, comments, additional_risk_needs, offender_accepted, items } = req.body;
  if (!plan_date) {
    return res.status(400).json({ error: 'plan_date is required' });
  }

  const now = new Date().toISOString();
  const [createdPlan] = await sql`
    INSERT INTO correctional_sentence_plans ${sql({
      offender_id: req.params.id,
      plan_date,
      comments: comments || null,
      additional_risk_needs: additional_risk_needs || null,
      offender_accepted: offender_accepted || null,
      created_at: now
    })}
    RETURNING *
  `;

  const itemRows = (Array.isArray(items) ? items : []).map((item) => ({
    plan_id: createdPlan.id,
    ...Object.fromEntries(CSP_ITEM_FIELDS.map((field) => [field, item[field] || null])),
    created_at: now
  }));

  const createdItems = itemRows.length
    ? await sql`INSERT INTO correctional_sentence_plan_items ${sql(itemRows)} RETURNING *`
    : [];

  res.status(201).json({ ...createdPlan, items: createdItems });
});

router.post('/:id/releases', async (req, res) => {
  const { release_date, release_type, amount_paid, date_paid } = req.body;
  if (!release_date || !release_type) {
    return res.status(400).json({ error: 'release_date and release_type are required' });
  }

  const row = {
    offender_id: req.params.id,
    release_date,
    release_type,
    amount_paid: amount_paid || null,
    date_paid: date_paid || null,
    created_at: new Date().toISOString()
  };
  const [created] = await sql`INSERT INTO releases ${sql(row)} RETURNING *`;
  res.status(201).json(created);
});

router.delete('/:id', async (req, res) => {
  const result = await sql`DELETE FROM offenders WHERE id = ${req.params.id}`;
  if (result.count === 0) return res.status(404).json({ error: 'Offender not found' });
  res.json({ deleted: true });
});

module.exports = router;
