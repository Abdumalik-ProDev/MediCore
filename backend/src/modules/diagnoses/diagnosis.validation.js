const { z } = require('zod');

const createDiagnosisSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  doctor_id: z.string().uuid().optional().nullable(),
  diagnosis_code: z.string().max(20).optional(),
  diagnosis_name: z.string().min(1, 'Diagnosis name is required').max(255),
  description: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional().default('moderate'),
  status: z.enum(['active', 'resolved', 'chronic']).optional().default('active'),
  diagnosed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  notes: z.string().optional(),
});

const updateDiagnosisSchema = createDiagnosisSchema.partial();

module.exports = { createDiagnosisSchema, updateDiagnosisSchema };
