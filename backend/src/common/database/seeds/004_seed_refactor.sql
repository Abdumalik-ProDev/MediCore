-- Receptionist profile
INSERT INTO receptionists (id, user_id, first_name, last_name, phone, email) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'Lucy', 'Muthoni', '555-2001', 'reception@medicore.com');

-- Disease categories
INSERT INTO disease_categories (id, name, description, icon) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Cardiovascular', 'Diseases of the heart and blood vessels', 'heart'),
  ('f0000000-0000-0000-0000-000000000002', 'Endocrine & Metabolic', 'Hormonal and metabolic disorders', 'activity'),
  ('f0000000-0000-0000-0000-000000000003', 'Respiratory', 'Diseases of the respiratory system', 'lungs'),
  ('f0000000-0000-0000-0000-000000000004', 'Musculoskeletal', 'Diseases of muscles, bones, and joints', 'bone'),
  ('f0000000-0000-0000-0000-000000000005', 'Mental Health', 'Psychiatric and behavioral disorders', 'brain'),
  ('f0000000-0000-0000-0000-000000000006', 'Infectious Diseases', 'Diseases caused by pathogenic microorganisms', 'virus'),
  ('f0000000-0000-0000-0000-000000000007', 'Dermatology', 'Diseases of the skin', 'skin'),
  ('f0000000-0000-0000-0000-000000000008', 'Renal & Urology', 'Kidney and urinary tract diseases', 'kidney'),
  ('f0000000-0000-0000-0000-000000000009', 'Gastroenterology', 'Diseases of the digestive system', 'digestive');

-- Diseases in centralized registry (matching old diagnosis seed data)
INSERT INTO diseases (id, category_id, name, description, icd_code, severity) VALUES
  ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Essential Hypertension', 'Elevated blood pressure readings above 140/90 mmHg', 'I10', 'moderate'),
  ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'Atrial Fibrillation', 'Irregularly irregular heart rhythm', 'I48.91', 'severe'),
  ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'Type 2 Diabetes', 'Non-insulin-dependent diabetes mellitus', 'E11.9', 'moderate'),
  ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003', 'Asthma', 'Chronic inflammatory airway disease', 'J45.9', 'mild'),
  ('10000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 'Acute Pharyngitis', 'Inflammation of the pharynx', 'J02.9', 'mild'),
  ('10000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000004', 'Osteoarthritis of Knee', 'Degenerative joint disease of the knee', 'M17.9', 'severe'),
  ('10000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000005', 'Major Depressive Disorder', 'Persistent low mood and anhedonia', 'F32.9', 'moderate'),
  ('10000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000007', 'Atopic Dermatitis', 'Chronic inflammatory skin condition', 'L20.9', 'mild'),
  ('10000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000008', 'Chronic Kidney Disease Stage 3', 'Moderate reduction in kidney function', 'N18.3', 'moderate'),
  ('10000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000009', 'GERD', 'Gastroesophageal reflux disease', 'K21.9', 'mild');

-- Migrate old diagnoses to medical_records (mapping by disease name)
INSERT INTO medical_records (id, patient_id, doctor_id, disease_id, severity, status, diagnosed_date, notes, created_at)
SELECT
  dx.id,
  dx.patient_id,
  dx.doctor_id,
  d.id AS disease_id,
  dx.severity,
  dx.status,
  dx.diagnosed_date,
  dx.notes,
  dx.created_at
FROM diagnoses dx
JOIN diseases d ON d.name = dx.diagnosis_name;

-- Seed appointments
INSERT INTO appointments (id, patient_id, doctor_id, receptionist_id, appointment_date, reason, status) VALUES
  ('20000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   now() + INTERVAL '2 days', 'Follow-up hypertension check', 'scheduled'),
  ('20000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
   now() + INTERVAL '5 days', 'Knee pain evaluation', 'scheduled'),
  ('20000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
   now() - INTERVAL '1 day', 'Routine cardiac checkup', 'completed');

-- Seed audit logs
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, new_values, created_at) VALUES
  ('30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'SYSTEM_INIT', 'migration', NULL,
   '{"event": "Platform refactored with centralized disease registry, RBAC, and audit logging"}',
   now());
