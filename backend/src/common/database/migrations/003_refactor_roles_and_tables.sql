-- Rename user_role enum value 'clinician' to 'doctor'
ALTER TYPE user_role RENAME VALUE 'clinician' TO 'doctor';

-- New enum for disease suggestion workflow
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

-- Disease categories (admin-managed taxonomy)
CREATE TABLE disease_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Centralized disease registry (admin-managed, unique per category)
CREATE TABLE diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES disease_categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icd_code VARCHAR(20),
  severity diagnosis_severity DEFAULT 'moderate',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Disease suggestions submitted by doctors when disease not in registry
CREATE TABLE disease_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name VARCHAR(255) NOT NULL,
  description TEXT,
  icd_code VARCHAR(20),
  suggested_category_id UUID REFERENCES disease_categories(id),
  suggested_by UUID NOT NULL REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  status suggestion_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Medical records (replaces free-form diagnoses, enforces FK to diseases registry)
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
  severity diagnosis_severity DEFAULT 'moderate',
  status diagnosis_status DEFAULT 'active',
  diagnosed_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Receptionist profiles
CREATE TABLE receptionists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments (managed by receptionists)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  receptionist_id UUID REFERENCES receptionists(id) ON DELETE SET NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs for system oversight (admin approvals, etc.)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for new tables
CREATE INDEX idx_disease_categories_active ON disease_categories(is_active);
CREATE INDEX idx_diseases_category ON diseases(category_id);
CREATE INDEX idx_diseases_name ON diseases(name);
CREATE INDEX idx_diseases_icd ON diseases(icd_code);
CREATE INDEX idx_diseases_active ON diseases(is_active);
CREATE INDEX idx_disease_suggestions_status ON disease_suggestions(status);
CREATE INDEX idx_disease_suggestions_suggested_by ON disease_suggestions(suggested_by);
CREATE INDEX idx_disease_suggestions_reviewed_by ON disease_suggestions(reviewed_by);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_disease ON medical_records(disease_id);
CREATE INDEX idx_medical_records_deleted ON medical_records(deleted_at);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_receptionists_user ON receptionists(user_id);
CREATE INDEX idx_receptionists_active ON receptionists(is_active);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
