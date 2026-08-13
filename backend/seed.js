const sql = require('./db');
const { supabaseAdmin } = require('./auth');
const { DCS_MANAGEMENT_AREAS } = require('./dcs-facilities');
const { backfillReportHistory, generateDailyReportsForAllFacilities } = require('./report-engine');

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

async function seed() {
  const [{ n: offenderCount }] = await sql`SELECT COUNT(*) AS n FROM offenders`;
  if (Number(offenderCount) > 0) {
    console.log('Database already seeded — skipping.');
    return;
  }

  // Illustrative approved-bed-capacity figures (prototype scale, not real DCS
  // figures) — set below current headcount so the overcrowding KPI has
  // something real to show.
  const [{ id: pollsmoorId }] = await sql`
    INSERT INTO facilities (name, capacity, region) VALUES ('Pollsmoor', 4, 'Western Cape') RETURNING id
  `;
  const [{ id: goodwoodId }] = await sql`
    INSERT INTO facilities (name, capacity, region) VALUES ('Goodwood', 7, 'Western Cape') RETURNING id
  `;

  // Remaining DCS management areas, seeded with zero capacity/offenders so a
  // user can select any real management area at login even without demo data.
  if (DCS_MANAGEMENT_AREAS.length > 0) {
    await sql`
      INSERT INTO facilities ${sql(
        DCS_MANAGEMENT_AREAS.map((area) => ({ name: area.name, capacity: 0, region: area.region })),
        'name', 'capacity', 'region'
      )}
    `;
  }

  // BASS "Create Body receipt" — batches of inmates received prior to
  // individual profile capture; offenders below reference one of these.
  const bodyReceipts = [
    { facility_id: pollsmoorId, source_type: 'Court', source: 'Cape Town Magistrate Court', date_of_admission: daysAgo(400), total_inmates: 3 },
    { facility_id: goodwoodId, source_type: 'Police', source: 'Goodwood SAPS', date_of_admission: daysAgo(310), total_inmates: 2 }
  ];
  const bodyReceiptRows = await sql`
    INSERT INTO body_receipts ${sql(bodyReceipts, 'facility_id', 'source_type', 'source', 'date_of_admission', 'total_inmates')}
    RETURNING id
  `;
  const bodyReceiptIds = bodyReceiptRows.map((r) => r.id);

  const offenders = [
    { name: 'Thabo Nkosi', facility_id: pollsmoorId, admission_date: daysAgo(400), status: 'incarcerated', next_action: 'Parole board review', id_number: '8501015800083', next_of_kin_name: 'Nomsa Nkosi', next_of_kin_contact: '082 111 2233', warrant_type: 'J138A', nickname: 'T', registration_number: 'REG-2025-0041', religion: 'Christian', race: 'Black African', nationality: 'South Africa', marital_status: 'Single', address_street: '12 Vuyani Street', address_town: 'Khayelitsha', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Methodist', gender: 'Male', place_of_birth: 'Khayelitsha', date_of_birth: '1985-01-01', number_of_dependants: 2, postal_code: '7784', next_of_kin_relationship: 'Mother', next_of_kin_town: 'Khayelitsha', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7784', body_receipt_id: bodyReceiptIds[0] },
    { name: 'Sipho Dlamini', facility_id: pollsmoorId, admission_date: daysAgo(220), status: 'incarcerated', next_action: 'Disciplinary hearing', id_number: '9002026800084', next_of_kin_name: 'Zanele Dlamini', next_of_kin_contact: '083 222 3344', warrant_type: 'J138A', nickname: 'Skhumba', registration_number: 'REG-2025-0092', religion: 'Christian', race: 'Black African', nationality: 'South Africa', marital_status: 'Married', address_street: '4 Ntlangano Road', address_town: 'Gugulethu', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Anglican', gender: 'Male', place_of_birth: 'Gugulethu', date_of_birth: '1990-02-02', number_of_dependants: 3, postal_code: '7750', next_of_kin_relationship: 'Spouse', next_of_kin_town: 'Gugulethu', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7750', body_receipt_id: bodyReceiptIds[0] },
    { name: 'Johannes van der Merwe', facility_id: pollsmoorId, admission_date: daysAgo(700), status: 'community_corrections', next_action: 'Monthly check-in', id_number: '7511037800085', next_of_kin_name: 'Marie van der Merwe', next_of_kin_contact: '084 333 4455', warrant_type: 'G306', nickname: 'Hannes', registration_number: 'REG-2024-0117', religion: 'Christian', race: 'White', nationality: 'South Africa', marital_status: 'Married', address_street: '9 Kerk Street', address_town: 'Bellville', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Dutch Reformed', gender: 'Male', place_of_birth: 'Bellville', date_of_birth: '1975-11-03', number_of_dependants: 1, postal_code: '7530', next_of_kin_relationship: 'Spouse', next_of_kin_town: 'Bellville', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7530', body_receipt_id: bodyReceiptIds[0] },
    { name: 'Bongani Zulu', facility_id: pollsmoorId, admission_date: daysAgo(90), status: 'incarcerated', next_action: 'TB screening follow-up', id_number: '9612048800086', next_of_kin_name: 'Precious Zulu', next_of_kin_contact: '085 444 5566', warrant_type: 'J69', nickname: 'Bo', registration_number: 'REG-2026-0008', religion: 'Christian', race: 'Black African', nationality: 'South Africa', marital_status: 'Single', address_street: '21 Mandela Drive', address_town: 'Delft', address_province: 'Western Cape', sentence_status: 'remand', passport_number: null, denomination: 'Zion Christian Church', gender: 'Male', place_of_birth: 'Delft', date_of_birth: '1996-12-04', number_of_dependants: 0, postal_code: '7100', next_of_kin_relationship: 'Sister', next_of_kin_town: 'Delft', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7100', body_receipt_id: null },
    { name: 'Pieter Botha', facility_id: pollsmoorId, admission_date: daysAgo(1200), status: 'released', next_action: null, id_number: '6803055800087', next_of_kin_name: 'Anna Botha', next_of_kin_contact: '086 555 6677', warrant_type: 'J7E', nickname: null, registration_number: 'REG-2022-0203', religion: 'Christian', race: 'Coloured', nationality: 'South Africa', marital_status: 'Widowed', address_street: '14 Mascom Street', address_town: 'Cape Town', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Roman Catholic', gender: 'Male', place_of_birth: 'Cape Town', date_of_birth: '1968-03-05', number_of_dependants: 0, postal_code: '8001', next_of_kin_relationship: 'Daughter', next_of_kin_town: 'Cape Town', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '8001', body_receipt_id: null },
    { name: 'Lindiwe Khumalo', facility_id: goodwoodId, admission_date: daysAgo(310), status: 'incarcerated', next_action: 'Medical review', id_number: '8809066800088', next_of_kin_name: 'Sibongile Khumalo', next_of_kin_contact: '087 666 7788', warrant_type: 'J138A', nickname: 'Lindi', registration_number: 'REG-2025-0155', religion: 'Christian', race: 'Black African', nationality: 'South Africa', marital_status: 'Single', address_street: '3 Nyanga Avenue', address_town: 'Nyanga', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Methodist', gender: 'Female', place_of_birth: 'Nyanga', date_of_birth: '1988-06-06', number_of_dependants: 2, postal_code: '7750', next_of_kin_relationship: 'Sister', next_of_kin_town: 'Nyanga', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7750', body_receipt_id: bodyReceiptIds[1] },
    { name: 'Andile Mahlangu', facility_id: goodwoodId, admission_date: daysAgo(60), status: 'incarcerated', next_action: 'Intake assessment', id_number: '9405077800089', next_of_kin_name: 'Thandeka Mahlangu', next_of_kin_contact: '071 777 8899', warrant_type: 'J138E', nickname: null, registration_number: 'REG-2026-0019', religion: 'Traditional', race: 'Black African', nationality: 'South Africa', marital_status: 'Single', address_street: '18 Sizwe Street', address_town: 'Philippi', address_province: 'Western Cape', sentence_status: 'remand', passport_number: null, denomination: null, gender: 'Male', place_of_birth: 'Philippi', date_of_birth: '1994-05-07', number_of_dependants: 1, postal_code: '7785', next_of_kin_relationship: 'Mother', next_of_kin_town: 'Philippi', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7785', body_receipt_id: null },
    { name: 'Willem Pretorius', facility_id: goodwoodId, admission_date: daysAgo(500), status: 'community_corrections', next_action: 'Monthly check-in', id_number: '7203088800090', next_of_kin_name: 'Elsa Pretorius', next_of_kin_contact: '072 888 9900', warrant_type: 'G344', nickname: 'Willie', registration_number: 'REG-2024-0066', religion: 'Christian', race: 'White', nationality: 'South Africa', marital_status: 'Divorced', address_street: '7 Voortrekker Road', address_town: 'Goodwood', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Apostolic Faith Mission', gender: 'Male', place_of_birth: 'Goodwood', date_of_birth: '1972-03-08', number_of_dependants: 2, postal_code: '7460', next_of_kin_relationship: 'Ex-spouse', next_of_kin_town: 'Goodwood', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7460', body_receipt_id: null },
    { name: 'Nomvula Mokoena', facility_id: goodwoodId, admission_date: daysAgo(150), status: 'incarcerated', next_action: 'Disciplinary hearing', id_number: '9909099800091', next_of_kin_name: 'Fikile Mokoena', next_of_kin_contact: '073 999 0011', warrant_type: 'J138A', nickname: null, registration_number: 'REG-2025-0208', religion: 'Christian', race: 'Black African', nationality: 'South Africa', marital_status: 'Single', address_street: '26 Church Street', address_town: 'Athlone', address_province: 'Western Cape', sentence_status: 'sentenced', passport_number: null, denomination: 'Baptist', gender: 'Female', place_of_birth: 'Athlone', date_of_birth: '1999-09-09', number_of_dependants: 0, postal_code: '7764', next_of_kin_relationship: 'Mother', next_of_kin_town: 'Athlone', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7764', body_receipt_id: bodyReceiptIds[1] },
    { name: 'Ruan Fourie', facility_id: goodwoodId, admission_date: daysAgo(30), status: 'incarcerated', next_action: 'Intake assessment', id_number: '0107109800092', next_of_kin_name: 'Sanet Fourie', next_of_kin_contact: '074 000 1122', warrant_type: 'J138A', nickname: null, registration_number: 'REG-2026-0027', religion: 'Christian', race: 'White', nationality: 'South Africa', marital_status: 'Single', address_street: '2 Durban Road', address_town: 'Bellville', address_province: 'Western Cape', sentence_status: 'remand', passport_number: null, denomination: 'Dutch Reformed', gender: 'Male', place_of_birth: 'Bellville', date_of_birth: '2001-07-10', number_of_dependants: 0, postal_code: '7530', next_of_kin_relationship: 'Mother', next_of_kin_town: 'Bellville', next_of_kin_province: 'Western Cape', next_of_kin_postal_code: '7530', body_receipt_id: null }
  ];

  const offenderColumns = [
    'name', 'facility_id', 'admission_date', 'status', 'next_action', 'id_number',
    'next_of_kin_name', 'next_of_kin_contact', 'warrant_type',
    'nickname', 'registration_number', 'religion', 'race', 'nationality', 'marital_status',
    'address_street', 'address_town', 'address_province',
    'sentence_status', 'passport_number', 'denomination', 'gender', 'place_of_birth',
    'date_of_birth', 'number_of_dependants', 'postal_code',
    'next_of_kin_relationship', 'next_of_kin_town', 'next_of_kin_province', 'next_of_kin_postal_code',
    'body_receipt_id'
  ];
  const offenderRows = await sql`
    INSERT INTO offenders ${sql(offenders, ...offenderColumns)}
    RETURNING id
  `;
  const offenderIds = offenderRows.map((r) => r.id);

  const healthRecords = [
    { offender_id: offenderIds[0], hiv_positive: true, viral_load_suppressed: true, tb_status: 'none' },
    { offender_id: offenderIds[1], hiv_positive: false, viral_load_suppressed: null, tb_status: 'cured' },
    { offender_id: offenderIds[2], hiv_positive: true, viral_load_suppressed: false, tb_status: 'none' },
    { offender_id: offenderIds[3], hiv_positive: false, viral_load_suppressed: null, tb_status: 'active' },
    { offender_id: offenderIds[4], hiv_positive: false, viral_load_suppressed: null, tb_status: 'cured' },
    { offender_id: offenderIds[5], hiv_positive: true, viral_load_suppressed: true, tb_status: 'none' },
    { offender_id: offenderIds[6], hiv_positive: false, viral_load_suppressed: null, tb_status: 'active' },
    { offender_id: offenderIds[7], hiv_positive: true, viral_load_suppressed: true, tb_status: 'cured' },
    { offender_id: offenderIds[8], hiv_positive: false, viral_load_suppressed: null, tb_status: 'none' },
    { offender_id: offenderIds[9], hiv_positive: false, viral_load_suppressed: null, tb_status: 'none' }
  ];
  await sql`INSERT INTO health_records ${sql(healthRecords, 'offender_id', 'hiv_positive', 'viral_load_suppressed', 'tb_status')}`;

  // 17 historical incidents spread over the last ~6 months, all pre-synced.
  // Types mirror DCS's distinct registers (escape, attempted escape, assault,
  // contraband, death in custody, disciplinary hearing).
  const incidents = [
    { offender_id: offenderIds[0], type: 'assault', injury: true, timestamp: daysAgo(175), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[1], type: 'contraband', injury: false, timestamp: daysAgo(168), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[3], type: 'assault', injury: false, timestamp: daysAgo(160), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[5], type: 'escape_attempt', injury: false, timestamp: daysAgo(150), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[6], type: 'contraband', injury: false, timestamp: daysAgo(140), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[1], type: 'assault', injury: true, timestamp: daysAgo(120), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[8], type: 'assault', injury: false, timestamp: daysAgo(110), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[3], type: 'contraband', injury: false, timestamp: daysAgo(95), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[9], type: 'escape', injury: false, timestamp: daysAgo(80), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[0], type: 'contraband', injury: false, timestamp: daysAgo(65), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[6], type: 'assault', injury: true, timestamp: daysAgo(50), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[8], type: 'assault', injury: true, timestamp: daysAgo(40), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[1], type: 'escape_attempt', injury: false, timestamp: daysAgo(25), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[3], type: 'assault', injury: false, timestamp: daysAgo(12), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[9], type: 'contraband', injury: false, timestamp: daysAgo(4), facility_id: goodwoodId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[1], type: 'disciplinary_hearing', injury: false, timestamp: daysAgo(200), facility_id: pollsmoorId, synced: 1, logged_offline: 0 },
    { offender_id: offenderIds[4], type: 'death', injury: false, timestamp: daysAgo(1180), facility_id: pollsmoorId, synced: 1, logged_offline: 0 }
  ];
  await sql`INSERT INTO incidents ${sql(incidents, 'offender_id', 'type', 'injury', 'timestamp', 'facility_id', 'synced', 'logged_offline')}`;

  const educationRecords = [
    { offender_id: offenderIds[0], programme: 'Adult Basic Education (ABET)', attendance_pct: 82, status: 'enrolled' },
    { offender_id: offenderIds[1], programme: 'Carpentry Skills', attendance_pct: 95, status: 'completed' },
    { offender_id: offenderIds[2], programme: 'Life Skills Reintegration', attendance_pct: 100, status: 'completed' },
    { offender_id: offenderIds[3], programme: 'Adult Basic Education (ABET)', attendance_pct: 40, status: 'withdrawn' },
    { offender_id: offenderIds[5], programme: 'Plumbing Skills', attendance_pct: 75, status: 'enrolled' },
    { offender_id: offenderIds[6], programme: 'Adult Basic Education (ABET)', attendance_pct: 60, status: 'enrolled' },
    { offender_id: offenderIds[8], programme: 'Welding Skills', attendance_pct: 88, status: 'enrolled' }
  ];
  await sql`INSERT INTO education_records ${sql(educationRecords, 'offender_id', 'programme', 'attendance_pct', 'status')}`;

  const caseNotes = [
    { offender_id: offenderIds[0], author_role: 'social_work', note: 'Family visit scheduled for next month; offender responding well to reintegration prep.', created_at: daysAgo(150) },
    { offender_id: offenderIds[0], author_role: 'psychology', note: 'No signs of acute distress. Continue monthly check-ins.', created_at: daysAgo(60) },
    { offender_id: offenderIds[1], author_role: 'spiritual_care', note: 'Attends weekly chapel sessions voluntarily.', created_at: daysAgo(100) },
    { offender_id: offenderIds[3], author_role: 'psychology', note: 'Flagged for follow-up after disciplinary hearing; referred for anger management.', created_at: daysAgo(90) },
    { offender_id: offenderIds[3], author_role: 'social_work', note: 'TB treatment adherence discussed with offender; understands isolation protocol.', created_at: daysAgo(80) },
    { offender_id: offenderIds[6], author_role: 'social_work', note: 'Intake assessment completed; no immediate welfare concerns.', created_at: daysAgo(55) },
    { offender_id: offenderIds[8], author_role: 'psychology', note: 'Repeat assault incidents noted; recommend closer monitoring.', created_at: daysAgo(35) }
  ];
  await sql`INSERT INTO case_notes ${sql(caseNotes, 'offender_id', 'author_role', 'note', 'created_at')}`;

  const riskAssessments = [
    { offender_id: offenderIds[0], assessment_type: 'security_classification', risk_level: 'medium', assessment_date: daysAgo(380), assessor: 'Case Officer M. Radebe', notes: 'Stable behaviour, no escalation since admission.' },
    { offender_id: offenderIds[1], assessment_type: 'psychological', risk_level: 'high', assessment_date: daysAgo(200), assessor: 'Dr. N. Naidoo', notes: 'Repeat disciplinary incidents; recommend closer monitoring.' },
    { offender_id: offenderIds[3], assessment_type: 'substance_abuse', risk_level: 'medium', assessment_date: daysAgo(85), assessor: 'Case Officer S. Adams', notes: 'Referred to substance abuse programme.' },
    { offender_id: offenderIds[5], assessment_type: 'security_classification', risk_level: 'low', assessment_date: daysAgo(300), assessor: 'Case Officer M. Radebe', notes: 'Minimum security suitable.' },
    { offender_id: offenderIds[8], assessment_type: 'psychological', risk_level: 'high', assessment_date: daysAgo(30), assessor: 'Dr. N. Naidoo', notes: 'Pattern of aggression; recommend anger management referral.' }
  ];
  await sql`INSERT INTO risk_assessments ${sql(riskAssessments, 'offender_id', 'assessment_type', 'risk_level', 'assessment_date', 'assessor', 'notes')}`;

  const courtCases = [
    { offender_id: offenderIds[1], case_number: 'CC-2026/0412', charge: 'Assault with intent to cause grievous bodily harm', court: 'Cape Town Magistrate Court', status: 'pending', next_court_date: daysAgo(-21) },
    { offender_id: offenderIds[3], case_number: 'CC-2026/0198', charge: 'Possession of contraband', court: 'Bellville Magistrate Court', status: 'postponed', next_court_date: daysAgo(-45) },
    { offender_id: offenderIds[8], case_number: 'CC-2025/0877', charge: 'Assault', court: 'Goodwood Magistrate Court', status: 'pending', next_court_date: daysAgo(-10) }
  ];
  await sql`INSERT INTO court_cases ${sql(courtCases, 'offender_id', 'case_number', 'charge', 'court', 'status', 'next_court_date')}`;

  const criminalHistory = [
    { offender_id: offenderIds[0], offense: 'Theft', sentence_description: '18 months, suspended', date: daysAgo(2100) },
    { offender_id: offenderIds[2], offense: 'Housebreaking', sentence_description: '3 years', date: daysAgo(3000) },
    { offender_id: offenderIds[4], offense: 'Robbery', sentence_description: '5 years', date: daysAgo(4200) },
    { offender_id: offenderIds[7], offense: 'Fraud', sentence_description: '2 years, correctional supervision', date: daysAgo(1800) }
  ];
  await sql`INSERT INTO criminal_history ${sql(criminalHistory, 'offender_id', 'offense', 'sentence_description', 'date')}`;

  const paroleRecords = [
    { offender_id: offenderIds[0], hearing_date: daysAgo(-30), outcome: 'scheduled', next_eligible_date: null },
    { offender_id: offenderIds[2], hearing_date: daysAgo(400), outcome: 'granted', next_eligible_date: null },
    { offender_id: offenderIds[4], hearing_date: daysAgo(250), outcome: 'granted', next_eligible_date: null },
    { offender_id: offenderIds[7], hearing_date: daysAgo(120), outcome: 'denied', next_eligible_date: daysAgo(-180) }
  ];
  await sql`INSERT INTO parole_records ${sql(paroleRecords, 'offender_id', 'hearing_date', 'outcome', 'next_eligible_date')}`;

  const nutritionRecords = [
    { offender_id: offenderIds[0], diet_type: 'standard', allergies: null, special_requirements: null },
    { offender_id: offenderIds[1], diet_type: 'diabetic', allergies: null, special_requirements: 'Low-sugar meals per medical referral' },
    { offender_id: offenderIds[3], diet_type: 'halal', allergies: 'Peanuts', special_requirements: null },
    { offender_id: offenderIds[5], diet_type: 'vegetarian', allergies: null, special_requirements: null },
    { offender_id: offenderIds[6], diet_type: 'standard', allergies: null, special_requirements: 'TB isolation meal delivery' }
  ];
  await sql`INSERT INTO nutrition_records ${sql(nutritionRecords, 'offender_id', 'diet_type', 'allergies', 'special_requirements')}`;

  const spiritualRecords = [
    { offender_id: offenderIds[0], religion: 'Christian', programme: 'Weekly chapel service', notes: 'Active participant.' },
    { offender_id: offenderIds[1], religion: 'Christian', programme: 'Weekly chapel service', notes: 'Attends voluntarily.' },
    { offender_id: offenderIds[3], religion: 'Muslim', programme: "Jumu'ah Friday prayers", notes: null },
    { offender_id: offenderIds[8], religion: 'Traditional', programme: null, notes: 'Requested visit from traditional healer counsellor.' }
  ];
  await sql`INSERT INTO spiritual_records ${sql(spiritualRecords, 'offender_id', 'religion', 'programme', 'notes')}`;

  const screenings = [
    { offender_id: offenderIds[0], screening_type: 'prostate', date_screened: daysAgo(200), signs_symptoms: 'None reported', lab_test: 'PSA', lab_result: 'Normal', cd4_count: null, j138_case: 0, referred_to: null },
    { offender_id: offenderIds[1], screening_type: 'cryptococcal_meningitis', date_screened: daysAgo(110), signs_symptoms: 'Headache, neck stiffness', lab_test: null, lab_result: null, cd4_count: '180', j138_case: 1, referred_to: 'External hospital' },
    { offender_id: offenderIds[3], screening_type: 'prostate', date_screened: daysAgo(70), signs_symptoms: 'None reported', lab_test: 'PSA', lab_result: 'Elevated', cd4_count: null, j138_case: 0, referred_to: 'Facility Dr' },
    { offender_id: offenderIds[5], screening_type: 'cervical', date_screened: daysAgo(160), signs_symptoms: 'None reported', lab_test: 'Pap smear', lab_result: 'Normal', cd4_count: null, j138_case: 0, referred_to: null },
    { offender_id: offenderIds[8], screening_type: 'cervical', date_screened: daysAgo(90), signs_symptoms: 'Abnormal bleeding', lab_test: 'Pap smear', lab_result: 'Abnormal cells detected', cd4_count: null, j138_case: 0, referred_to: 'Facility Dr' }
  ];
  await sql`
    INSERT INTO screening_records ${sql(
      screenings,
      'offender_id', 'screening_type', 'date_screened', 'signs_symptoms', 'lab_test', 'lab_result', 'cd4_count', 'j138_case', 'referred_to'
    )}
  `;

  // Demo users are created through Supabase Auth (not a local table); the
  // on_auth_user_created trigger creates the matching profiles row, and we
  // then set facility_id since sign-up metadata only carries name/role.
  // 'scope' governs how KPI reporting rolls up: 'facility' users (the
  // default) see one management area; 'regional' users roll up every
  // facility in their province (regional-commissioner view); 'national'
  // users roll up every facility (head-office view).
  const demoUsers = [
    { email: 'admin@dcs.gov.za', name: 'Nomvula Dlamini', password: 'admin123', role: 'admin', facility_id: null, scope: 'national', region: null },
    { email: 'official@dcs.gov.za', name: 'Sipho Mthembu', password: 'official123', role: 'official', facility_id: pollsmoorId, scope: 'facility', region: null },
    { email: 'clerk@dcs.gov.za', name: 'Anele Botha', password: 'clerk123', role: 'clerk', facility_id: pollsmoorId, scope: 'facility', region: null },
    { email: 'regional@dcs.gov.za', name: 'Nolwazi Khumalo', password: 'regional123', role: 'official', facility_id: null, scope: 'regional', region: 'Western Cape' }
  ];
  for (const u of demoUsers) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role, scope: u.scope }
    });
    if (error) throw error;
    await sql`UPDATE profiles SET facility_id = ${u.facility_id}, scope = ${u.scope}, region = ${u.region} WHERE id = ${data.user.id}`;
  }

  await backfillReportHistory(sql, 14);
  await generateDailyReportsForAllFacilities(sql);

  console.log(`Seeded ${offenders.length} offenders, ${healthRecords.length} health records, ${incidents.length} incidents, ${educationRecords.length} education records, ${caseNotes.length} case notes, ${riskAssessments.length} risk assessments, ${courtCases.length} court cases, ${criminalHistory.length} criminal history entries, ${paroleRecords.length} parole records, ${nutritionRecords.length} nutrition records, ${spiritualRecords.length} spiritual records, ${screenings.length} screening records, ${demoUsers.length} demo users across 2 facilities.`);
}

module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
