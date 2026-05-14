const { z } = require('zod');
const SEVERITIES = ['mild', 'moderate', 'severe', 'critical'];
const STATUSES = ['active', 'resolved', 'chronic'];
const createMedicalRecordSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  doctor_id: z.string().uuid().optional().nullable(),
  disease_id: z.string().uuid('Invalid disease ID'),
  severity: z.enum(SEVERITIES).optional().default('moderate'),
  status: z.enum(STATUSES).optional().default('active'),
  diagnosed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  notes: z.string().optional(),
});
const updateMedicalRecordSchema = createMedicalRecordSchema.partial();
module.exports = { createMedicalRecordSchema, updateMedicalRecordSchema };
