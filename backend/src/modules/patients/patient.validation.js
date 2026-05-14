const { z } = require('zod');

const SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];

const createPatientSchema = z.object({
  doctor_id: z.string().uuid().optional().nullable(),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  gender: z.string().max(10).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  address: z.string().optional(),
  blood_group: z.string().max(5).optional(),
  allergies: z.string().optional(),
  emergency_contact: z.string().max(100).optional(),
  emergency_phone: z.string().max(20).optional(),
  disease_id: z.string().uuid('Invalid disease ID').optional(),
  severity: z.enum(SEVERITIES).optional(),
  notes: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

module.exports = { createPatientSchema, updatePatientSchema };
