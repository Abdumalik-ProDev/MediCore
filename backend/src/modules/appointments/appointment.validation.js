const { z } = require('zod');

const STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];

const createAppointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  doctor_id: z.string().uuid().optional().nullable(),
  appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  patient_id: z.string().uuid().optional(),
  doctor_id: z.string().uuid().optional().nullable(),
  appointment_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(STATUSES).optional(),
});

module.exports = { createAppointmentSchema, updateAppointmentSchema };
