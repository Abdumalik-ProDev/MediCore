-- Users (password: "password123" hashed with bcrypt)
INSERT INTO users (id, email, password_hash, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@medicore.com',
   '$2a$10$CWq/UlrP4S4XgtjJWRLi/utGQ/UWP3Kahn.vj6yWePLSVd64RgtSm', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'clinician@medicore.com',
   '$2a$10$CWq/UlrP4S4XgtjJWRLi/utGQ/UWP3Kahn.vj6yWePLSVd64RgtSm', 'clinician'),
  ('a0000000-0000-0000-0000-000000000003', 'reception@medicore.com',
   '$2a$10$CWq/UlrP4S4XgtjJWRLi/utGQ/UWP3Kahn.vj6yWePLSVd64RgtSm', 'receptionist');

-- Doctors
INSERT INTO doctors (id, user_id, first_name, last_name, specialization, license_number, phone, email) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
   'Sarah', 'Chen', 'Cardiology', 'LIC-2024-001', '555-0101', 'sarah.chen@medicore.com'),
  ('b0000000-0000-0000-0000-000000000002', NULL,
   'James', 'Mwangi', 'Pediatrics', 'LIC-2024-002', '555-0102', 'james.mwangi@medicore.com');

-- Patients (assigned to doctor 1)
INSERT INTO patients (id, doctor_id, first_name, last_name, date_of_birth, gender, phone, email,
  address, blood_group, allergies, emergency_contact, emergency_phone) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
   'Emily', 'Johnson', '1985-03-12', 'Female', '555-1001', 'emily.j@email.com',
   '123 Oak St, Springfield', 'A+', 'Penicillin', 'Mark Johnson', '555-9001'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001',
   'Robert', 'Kimani', '1990-07-25', 'Male', '555-1002', 'robert.k@email.com',
   '456 Maple Ave, Springfield', 'O+', 'None', 'Jane Kimani', '555-9002'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002',
   'Maria', 'Garcia', '1972-11-08', 'Female', '555-1003', 'maria.g@email.com',
   '789 Pine Rd, Springfield', 'B-', 'Sulfa drugs', 'Carlos Garcia', '555-9003'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002',
   'David', 'Ochieng', '2000-01-30', 'Male', '555-1004', 'david.o@email.com',
   '321 Elm St, Springfield', 'AB+', 'Peanuts', 'Grace Ochieng', '555-9004'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001',
   'Alice', 'Wanjiku', '1965-06-18', 'Female', '555-1005', 'alice.w@email.com',
   '654 Birch Ln, Springfield', 'A-', 'Aspirin', 'Peter Wanjiku', '555-9005');

-- Diagnoses (ICD-10 codes)
INSERT INTO diagnoses (id, patient_id, doctor_id, diagnosis_code, diagnosis_name, description,
  severity, status, diagnosed_date, notes) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'I10', 'Essential Hypertension', 'Elevated blood pressure readings above 140/90 mmHg',
   'moderate', 'active', '2025-11-15', 'Prescribed lisinopril 10mg daily.'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'E11.9', 'Type 2 Diabetes', 'HbA1c 7.8%, fasting glucose 145 mg/dL',
   'moderate', 'active', '2026-01-10', 'Dietary counseling provided. Metformin 500mg BID.'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'J45.9', 'Asthma', 'Allergic asthma with seasonal exacerbations',
   'mild', 'active', '2026-02-20', 'Albuterol inhaler as needed.'),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000002',
   'M17.9', 'Osteoarthritis of Knee', 'Bilateral knee joint degeneration, more severe on left',
   'severe', 'active', '2025-09-05', 'Referred to orthopedics. NSAIDs prescribed.'),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000002',
   'F32.9', 'Major Depressive Disorder', 'Patient reports persistent low mood, anhedonia, insomnia',
   'moderate', 'active', '2026-03-12', 'Started sertraline 50mg. Referred to counseling.'),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000002',
   'J02.9', 'Acute Pharyngitis', 'Sore throat, erythematous pharynx, negative strep test',
   'mild', 'resolved', '2026-04-01', 'Symptomatic treatment. Resolved in 5 days.'),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000002',
   'L20.9', 'Atopic Dermatitis', 'Eczematous patches on flexural surfaces',
   'mild', 'active', '2026-04-10', 'Topical hydrocortisone. Moisturizing regimen.'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000001',
   'I48.91', 'Atrial Fibrillation', 'Irregularly irregular rhythm, rate controlled',
   'severe', 'chronic', '2025-07-22', 'On apixaban 5mg BID. Metoprolol 25mg daily.'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000001',
   'N18.3', 'Chronic Kidney Disease Stage 3', 'eGFR 45 mL/min/1.73m2',
   'moderate', 'chronic', '2025-08-14', 'Nephrology follow-up. ACE inhibitor adjusted.'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'K21.9', 'GERD', 'Heartburn, regurgitation, responsive to PPI therapy',
   'mild', 'active', '2026-05-01', 'Omeprazole 20mg daily. Dietary modifications advised.');
