const { z } = require('zod');

const createSuggestionSchema = z.object({
  disease_name: z.string().min(1, 'Disease name is required').max(255),
  description: z.string().optional(),
  icd_code: z.string().max(20).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional().default('moderate'),
  suggested_category_id: z.string().uuid().optional().nullable(),
});

const reviewSuggestionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  admin_notes: z.string().optional(),
});

module.exports = { createSuggestionSchema, reviewSuggestionSchema };
