const { z } = require('zod');

const createDiseaseSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  icd_code: z.string().max(20).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional().default('moderate'),
});

const updateDiseaseSchema = createDiseaseSchema.partial();

module.exports = { createDiseaseSchema, updateDiseaseSchema };
