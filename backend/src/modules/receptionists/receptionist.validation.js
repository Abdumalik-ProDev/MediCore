const { z } = require('zod');
const createReceptionistSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  user_id: z.string().uuid().optional().nullable(),
});
const updateReceptionistSchema = createReceptionistSchema.partial();
module.exports = { createReceptionistSchema, updateReceptionistSchema };
