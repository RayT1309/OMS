-- OMS schema, converted from backend/db.js (SQLite/better-sqlite3) to Postgres/Supabase.
-- AUTOINCREMENT -> GENERATED ALWAYS AS IDENTITY, BOOLEAN 0/1 -> true/false, REAL -> numeric.
-- users/sessions are dropped in favor of Supabase Auth (auth.users) + public.profiles (see 0002_auth.sql).

create table facilities (
  id integer generated always as identity primary key,
  name text not null unique,
  capacity integer not null default 0,
  region text
);

create table body_receipts (
  id integer generated always as identity primary key,
  facility_id integer not null references facilities(id),
  source_type text not null,
  source text not null,
  date_of_admission text not null,
  total_inmates integer not null,
  created_at timestamptz not null default now()
);

create table offenders (
  id integer generated always as identity primary key,
  name text not null,
  facility_id integer not null references facilities(id),
  admission_date text not null,
  status text not null check (status in ('incarcerated','community_corrections','released')),
  next_action text,
  id_number text,
  next_of_kin_name text,
  next_of_kin_contact text,
  warrant_type text,
  nickname text,
  registration_number text,
  religion text,
  race text,
  nationality text,
  marital_status text,
  address_street text,
  address_town text,
  address_province text,
  sentence_status text check (sentence_status in ('sentenced','remand')),
  passport_number text,
  denomination text,
  gender text,
  place_of_birth text,
  date_of_birth text,
  number_of_dependants integer,
  postal_code text,
  next_of_kin_relationship text,
  next_of_kin_town text,
  next_of_kin_province text,
  next_of_kin_postal_code text,
  body_receipt_id integer references body_receipts(id)
);

create table personal_property (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  item_description text not null,
  condition text not null check (condition in ('good','fair','poor')),
  estimated_value numeric,
  bag_number text
);

create table gang_affiliations (
  offender_id integer primary key references offenders(id),
  prison_gang text,
  prison_gang_rank text,
  street_gang text,
  street_gang_rank text
);

create table incidents (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  type text not null check (type in ('assault','escape_attempt','escape','contraband','death','disciplinary_hearing')),
  injury boolean not null default false,
  timestamp text not null,
  facility_id integer not null references facilities(id),
  synced integer not null default 1,
  logged_offline integer not null default 0
);

create table health_records (
  offender_id integer primary key references offenders(id),
  hiv_positive boolean not null default false,
  viral_load_suppressed boolean,
  tb_status text not null default 'none' check (tb_status in ('active','cured','none'))
);

create table education_records (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  programme text not null,
  attendance_pct integer not null default 0,
  status text not null check (status in ('enrolled','completed','withdrawn'))
);

create table case_notes (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  author_role text not null check (author_role in ('social_work','psychology','spiritual_care')),
  note text not null,
  created_at timestamptz not null default now()
);

create table risk_assessments (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  assessment_type text not null check (assessment_type in ('security_classification','psychological','substance_abuse')),
  risk_level text not null check (risk_level in ('low','medium','high')),
  assessment_date text not null,
  assessor text,
  notes text
);

create table court_cases (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  case_number text not null,
  charge text not null,
  court text,
  status text not null check (status in ('pending','postponed','finalized')),
  next_court_date text
);

create table criminal_history (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  offense text not null,
  sentence_description text,
  date text
);

create table parole_records (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  hearing_date text not null,
  outcome text not null check (outcome in ('scheduled','granted','denied','postponed')),
  next_eligible_date text
);

create table nutrition_records (
  offender_id integer primary key references offenders(id),
  diet_type text not null default 'standard',
  allergies text,
  special_requirements text
);

create table spiritual_records (
  offender_id integer primary key references offenders(id),
  religion text,
  programme text,
  notes text
);

create table screening_records (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  screening_type text not null check (screening_type in ('prostate','cervical','cryptococcal_meningitis')),
  date_screened text not null,
  signs_symptoms text,
  lab_test text,
  lab_result text,
  cd4_count text,
  j138_case integer,
  referred_to text
);

create table warrants (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  warrant_category text not null check (warrant_category in ('unsentenced','sentenced')),
  warrant_type text not null check (warrant_type in ('J7','J138A','J138E','G306','SAP69','G344','J1')),
  police_station text,
  district_regional_division text,
  provincial_local_division text,
  cas_no text,
  court_case_number text,
  cr_number text,
  docket_number text,
  fingerprint_no text,
  date_of_arrest text,
  investigating_officer text,
  investigating_officer_contact text,
  prosecutor text,
  legal_representative text,
  correctional_centre text,
  type_of_detention text,
  charges text,
  custody_until_date text,
  court text,
  type_of_court text,
  bail_particulars text,
  bail_amount text,
  hospital text,
  doctor text,
  enquiry_length_days integer,
  act_section text,
  report_submission_date text,
  home_address text,
  telephone_home text,
  telephone_work text,
  date_of_sentence text,
  offence text,
  sentence text,
  sentence_period_from text,
  sentence_period_to text,
  sentence_length text,
  parole_violation text,
  violation_length text,
  date_warrant_served text,
  community_corrections text,
  head_of_community_corrections text,
  number_of_warrants integer,
  charged_with text,
  date_offence_committed text,
  date_of_conviction text,
  classification_of_fine text,
  clerk_of_court text,
  dcs_case_number text,
  date_remanded_to text,
  sentence_category text,
  head_of_correctional_centre text,
  warrant_status text,
  judgment text,
  warrant_dated text,
  by_reason_of text,
  given_under_hand_at text,
  date_of_liberation text,
  created_at timestamptz not null default now()
);

create table admission_health_assessments (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  assessment_date text not null,
  assessed_by text,
  allergies text,
  behavioural_observation text,
  illness_needs_treatment text check (illness_needs_treatment in ('yes','no')),
  illness_specify text,
  injuries_needs_attention text check (injuries_needs_attention in ('yes','no')),
  injuries_specify text,
  medication_in_possession text check (medication_in_possession in ('yes','no')),
  medication_specify text,
  recent_operation text check (recent_operation in ('yes','no')),
  recent_operation_specify text,
  scheduled_appointments text check (scheduled_appointments in ('yes','no')),
  scheduled_appointments_specify text,
  medic_alert text check (medic_alert in ('yes','no')),
  medic_alert_specify text,
  disabilities text check (disabilities in ('yes','no')),
  disabilities_specify text,
  prostheses text check (prostheses in ('yes','no')),
  prostheses_specify text,
  last_meal text,
  hygiene_acceptable text check (hygiene_acceptable in ('yes','no')),
  hygiene_specify text,
  additional_comments text,
  created_at timestamptz not null default now()
);

create table section_a_assessments (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  assessment_date text not null,
  assessed_by text,

  child_convicted text check (child_convicted in ('yes','no')),
  child_crimes text,
  child_sanctions text,
  child_placed_programme text check (child_placed_programme in ('yes','no')),
  child_placed_reformatory integer default 0,
  child_reformatory_reasons text,
  child_placed_secure_care integer default 0,
  child_secure_care_reasons text,
  child_placed_court_programme integer default 0,
  child_court_programme_reasons text,
  child_special_school text check (child_special_school in ('yes','no')),
  child_suspended text check (child_suspended in ('yes','no')),
  child_suspended_reasons text,
  child_expelled text check (child_expelled in ('yes','no')),
  child_expelled_reasons text,

  youth_convicted text check (youth_convicted in ('yes','no')),
  youth_crimes text,
  youth_sanctions text,
  youth_victim_women integer default 0,
  youth_victim_men integer default 0,
  youth_victim_girls integer default 0,
  youth_victim_boys integer default 0,
  youth_victim_aged integer default 0,
  youth_victim_animals integer default 0,
  youth_victim_disabled integer default 0,
  youth_victim_children integer default 0,
  youth_victim_business integer default 0,
  youth_victim_other text,
  youth_victim_known text check (youth_victim_known in ('yes','no')),
  youth_victim_stranger text check (youth_victim_stranger in ('yes','no')),
  youth_harm_death integer default 0,
  youth_harm_serious integer default 0,
  youth_harm_minor integer default 0,
  youth_harm_other text,
  youth_weapon_none integer default 0,
  youth_weapon_firearm integer default 0,
  youth_weapon_knife integer default 0,
  youth_weapon_explosives integer default 0,
  youth_weapon_other text,

  adult_convicted text check (adult_convicted in ('yes','no')),
  adult_crimes text,
  adult_sanctions text,
  adult_victim_women integer default 0,
  adult_victim_men integer default 0,
  adult_victim_girls integer default 0,
  adult_victim_boys integer default 0,
  adult_victim_aged integer default 0,
  adult_victim_animals integer default 0,
  adult_victim_disabled integer default 0,
  adult_victim_children integer default 0,
  adult_victim_business integer default 0,
  adult_victim_other text,
  adult_victim_known text check (adult_victim_known in ('yes','no')),
  adult_victim_stranger text check (adult_victim_stranger in ('yes','no')),
  adult_harm_death integer default 0,
  adult_harm_serious integer default 0,
  adult_harm_minor integer default 0,
  adult_harm_other text,
  adult_weapon_none integer default 0,
  adult_weapon_firearm integer default 0,
  adult_weapon_knife integer default 0,
  adult_weapon_explosives integer default 0,
  adult_weapon_other text,

  offence_murder integer default 0,
  offence_culpable_homicide integer default 0,
  offence_assault integer default 0,
  offence_sexual integer default 0,
  offence_robbery integer default 0,
  offence_theft integer default 0,
  offence_fraud integer default 0,
  offence_drug_alcohol integer default 0,
  offence_firearm_ammo integer default 0,
  offence_weapons_explosives integer default 0,
  offence_property_damage integer default 0,
  offence_public_order integer default 0,
  offence_road_traffic integer default 0,
  offence_justice_govt integer default 0,
  offence_trafficking integer default 0,
  offence_freedom_movement integer default 0,
  offence_misc integer default 0,
  offence_other text,
  current_victim_women integer default 0,
  current_victim_men integer default 0,
  current_victim_girls integer default 0,
  current_victim_boys integer default 0,
  current_victim_aged integer default 0,
  current_victim_animals integer default 0,
  current_victim_disabled integer default 0,
  current_victim_children integer default 0,
  current_victim_business integer default 0,
  current_victim_other text,
  current_victim_known text check (current_victim_known in ('yes','no')),
  current_victim_stranger text check (current_victim_stranger in ('yes','no')),
  current_harm_death integer default 0,
  current_harm_serious integer default 0,
  current_harm_minor integer default 0,
  current_harm_other text,
  current_weapon_none integer default 0,
  current_weapon_firearm integer default 0,
  current_weapon_knife integer default 0,
  current_weapon_explosives integer default 0,
  current_weapon_other text,

  motive_financial integer default 0,
  motive_thrill_seeking integer default 0,
  motive_addiction integer default 0,
  motive_sexual integer default 0,
  motive_revenge integer default 0,
  motive_anger_aggression integer default 0,
  motive_hate integer default 0,
  motive_provocation integer default 0,
  motive_political integer default 0,
  motive_racial integer default 0,
  motive_emotional integer default 0,
  motive_other integer default 0,

  crime_under_influence text check (crime_under_influence in ('yes','no')),
  influence_alcohol integer default 0,
  influence_dagga integer default 0,
  influence_drugs integer default 0,
  influence_drugs_specify text,
  addicted_to_substances text check (addicted_to_substances in ('yes','no')),
  addicted_alcohol integer default 0,
  addicted_dagga integer default 0,
  addicted_mandrax integer default 0,
  addicted_tik integer default 0,
  addicted_heroine integer default 0,
  addicted_cocaine integer default 0,
  addicted_ecstasy integer default 0,
  addicted_crack integer default 0,
  addicted_glue integer default 0,
  addicted_prescriptive integer default 0,
  addicted_other text,
  substance_start_age integer,
  substance_treatment_received text check (substance_treatment_received in ('yes','no')),

  gang_member text check (gang_member in ('yes','no')),
  gang_assoc_family integer default 0,
  gang_assoc_friends integer default 0,
  gang_assoc_correctional integer default 0,
  gang_assoc_community integer default 0,
  gang_assoc_antisocial_peers integer default 0,
  gang_assoc_cult integer default 0,
  gang_assoc_political integer default 0,
  gang_assoc_mafia integer default 0,
  gang_assoc_organized_crime integer default 0,
  gang_assoc_criminal_peers integer default 0,
  gang_assoc_other text,
  crime_committed_in_group text check (crime_committed_in_group in ('yes','no')),
  gang_role text,
  gang_mission text,
  gang_mission_other text,
  relatives_involved_in_crime text check (relatives_involved_in_crime in ('yes','no')),

  created_at timestamptz not null default now()
);

create table section_b_assessments (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  assessment_date text not null,
  assessed_by text,

  can_read_write text check (can_read_write in ('yes','no')),
  highest_grade_category text,
  qualification_year text,
  trained_profession text check (trained_profession in ('yes','no')),
  trained_profession_specify text,
  practical_experience_years integer,
  qualified_registered text check (qualified_registered in ('yes','no')),
  qualified_registered_specify text,
  tertiary_education text check (tertiary_education in ('yes','no')),
  tertiary_qualification text,
  tertiary_field_of_study text,
  tertiary_year_obtained text,
  currently_studying text check (currently_studying in ('yes','no')),
  currently_studying_specify text,
  education_training_needs text check (education_training_needs in ('yes','no')),
  education_training_needs_specify text,

  has_skills_hobbies text check (has_skills_hobbies in ('yes','no')),
  skills_hobbies_specify text,
  competitive_sport text check (competitive_sport in ('yes','no')),
  competitive_sport_specify text,
  sport_recreation_training text check (sport_recreation_training in ('yes','no')),
  sport_recreation_training_specify text,
  arts_cultural_training text check (arts_cultural_training in ('yes','no')),
  arts_cultural_training_specify text,

  employed_before_incarceration text check (employed_before_incarceration in ('yes','no')),
  employment_type text,

  created_at timestamptz not null default now()
);

create table section_c_assessments (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  assessment_date text not null,
  assessed_by text,

  faith_member text check (faith_member in ('yes','no')),
  faith_member_specify text,
  faith_role text,
  faith_active_before text check (faith_active_before in ('yes','no')),
  faith_active_before_specify text,
  needs_spiritual_support text check (needs_spiritual_support in ('yes','no')),
  support_religious_services integer default 0,
  support_baptism integer default 0,
  support_counselling integer default 0,
  support_spiritual_visits integer default 0,
  support_marriage_counselling integer default 0,
  support_consultation integer default 0,
  support_other text,
  wants_religious_participation text check (wants_religious_participation in ('yes','no')),

  staying_with_at_arrest text,
  significant_spouse integer default 0,
  significant_parents integer default 0,
  significant_grandparents integer default 0,
  significant_siblings integer default 0,
  significant_uncle integer default 0,
  significant_aunt integer default 0,
  significant_own_children integer default 0,
  significant_in_laws integer default 0,
  significant_friends integer default 0,
  significant_other text,
  accommodation_type text,
  accommodation_other_specify text,
  neighbourhood_type text,
  neighbourhood_other_specify text,
  contact_visits integer default 0,
  contact_telephone integer default 0,
  contact_letters integer default 0,
  contact_none integer default 0,
  contact_other text,
  wants_contact_established text check (wants_contact_established in ('yes','no')),
  relationship_problems text check (relationship_problems in ('yes','no')),
  relationship_problems_specify text,
  has_dependants text check (has_dependants in ('yes','no')),
  num_adult_dependants integer,
  num_child_dependants integer,
  dependants_related text check (dependants_related in ('yes','no')),
  dependant_name text,
  dependant_relationship text,
  dependant_age text,
  responsible_child_maintenance text check (responsible_child_maintenance in ('yes','no')),
  sole_provider text check (sole_provider in ('yes','no')),
  dependants_need_social_assistance text check (dependants_need_social_assistance in ('yes','no')),

  mental_illness_treatment text check (mental_illness_treatment in ('yes','no')),
  mental_illness_treatment_date text,
  currently_on_mental_treatment text check (currently_on_mental_treatment in ('yes','no')),
  suicide_self_harm_treated text check (suicide_self_harm_treated in ('yes','no')),
  suicide_self_harm_specify text,
  suicidal_thoughts_now text check (suicidal_thoughts_now in ('yes','no')),
  flashbacks_nightmares text check (flashbacks_nightmares in ('yes','no')),
  convicted_sexual_offence_ever text check (convicted_sexual_offence_ever in ('yes','no')),
  prev_sex_rape integer default 0,
  prev_sex_attempted_rape integer default 0,
  prev_sex_sexual_assault integer default 0,
  prev_sex_statutory_rape integer default 0,
  prev_sex_indecent_assault integer default 0,
  prev_sex_sodomy integer default 0,
  prev_sex_other text,
  current_conviction_sexual_offence text check (current_conviction_sexual_offence in ('yes','no')),
  current_sex_rape integer default 0,
  current_sex_attempted_rape integer default 0,
  current_sex_sexual_assault integer default 0,
  current_sex_statutory_rape integer default 0,
  current_sex_indecent_assault integer default 0,
  current_sex_sodomy integer default 0,
  current_sex_other text,
  victim_before_imprisonment text check (victim_before_imprisonment in ('yes','no')),
  victim_before_imprisonment_specify text,
  abused_since_admission text check (abused_since_admission in ('yes','no')),
  abused_reported_incident text check (abused_reported_incident in ('yes','no')),
  court_recommended_treatment text check (court_recommended_treatment in ('yes','no')),
  court_recommended_treatment_specify text,

  created_at timestamptz not null default now()
);

create table section_d_assessments (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  assessment_date text not null,
  assessed_by text,

  previous_crime_category text check (previous_crime_category in ('High Risk','Medium Risk','Low Risk')),
  current_crime_category text check (current_crime_category in ('High Risk','Medium Risk','Low Risk')),
  serving_multiple_sentences text check (serving_multiple_sentences in ('yes','no')),

  escaped integer default 0,
  attempted_escape integer default 0,
  aided_escape integer default 0,
  escape_none integer default 0,

  probation_revoked integer default 0,
  breached_parole integer default 0,
  breached_bail integer default 0,
  absconded integer default 0,

  institutional_offences text check (institutional_offences in ('yes','no')),
  convicted_racial_political_offence text check (convicted_racial_political_offence in ('yes','no')),
  convicted_racial_political_offence_specify text,
  further_charges text check (further_charges in ('yes','no')),
  further_charges_specify text,
  threatened_since_admission text check (threatened_since_admission in ('yes','no')),
  threatened_since_admission_specify text,

  created_at timestamptz not null default now()
);

create table correctional_sentence_plans (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  plan_date text not null,
  comments text,
  additional_risk_needs text,
  offender_accepted text check (offender_accepted in ('yes','no')),
  created_at timestamptz not null default now()
);

create table correctional_sentence_plan_items (
  id integer generated always as identity primary key,
  plan_id integer not null references correctional_sentence_plans(id),
  category text not null check (category in (
    'corrections','development','care_spiritual','care_social',
    'care_emotional','care_health','social_integration','security','facilities'
  )),
  identified_risk_need text,
  identified_risk_need_other_specify text,
  programme text,
  programme_other_specify text,
  service_provider text,
  timeframe text check (timeframe in ('Short term','Medium term','Long term')),
  created_at timestamptz not null default now()
);

create table releases (
  id integer generated always as identity primary key,
  offender_id integer not null references offenders(id),
  release_date text not null,
  release_type text not null check (release_type in (
    'court','hospital','police_station','correctional_centre','labour','community_corrections'
  )),
  amount_paid numeric,
  date_paid text,
  created_at timestamptz not null default now()
);

-- One row per facility per day: a point-in-time snapshot of computeKPIs(),
-- unlike the live KPI/alerts views this IS stored, since a "report for
-- 12 Aug" must keep reading the same numbers even as live data changes later.
create table kpi_reports (
  id integer generated always as identity primary key,
  facility_id integer not null references facilities(id),
  report_date text not null,
  generated_at timestamptz not null default now(),
  payload jsonb not null,
  unique(facility_id, report_date)
);
