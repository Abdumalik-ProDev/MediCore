CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('admin', 'clinician', 'receptionist');

DROP TYPE IF EXISTS diagnosis_severity CASCADE;
CREATE TYPE diagnosis_severity AS ENUM ('mild', 'moderate', 'severe', 'critical');

DROP TYPE IF EXISTS diagnosis_status CASCADE;
CREATE TYPE diagnosis_status AS ENUM ('active', 'resolved', 'chronic');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'receptionist',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(255) NOT NULL DEFAULT 'General Medicine',
  license_number VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  blood_group VARCHAR(5),
  allergies TEXT,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  diagnosis_code VARCHAR(20),
  diagnosis_name VARCHAR(255) NOT NULL,
  description TEXT,
  severity diagnosis_severity DEFAULT 'moderate',
  status diagnosis_status DEFAULT 'active',
  diagnosed_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patients_doctor_id ON patients(doctor_id);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_doctor_id ON diagnoses(doctor_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_users_email ON users(email);
