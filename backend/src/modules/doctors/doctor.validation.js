const { z } = require('zod');

const createDoctorSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  specialization: z.string().max(255).optional().default('General Medicine'),
  license_number: z.string().min(1, 'License number is required').max(50),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
});

const updateDoctorSchema = createDoctorSchema.partial();

module.exports = { createDoctorSchema, updateDoctorSchema };
