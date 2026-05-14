const { z } = require('zod');

const createDiseaseCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  icon: z.string().max(50).optional(),
});

const updateDiseaseCategorySchema = createDiseaseCategorySchema.partial();

module.exports = { createDiseaseCategorySchema, updateDiseaseCategorySchema };
