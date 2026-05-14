const { Router } = require('express');
const controller = require('./appointment.controller');
const { createAppointmentSchema, updateAppointmentSchema } = require('./appointment.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'receptionist'), validate(createAppointmentSchema), controller.create);
router.put('/:id', authorize('admin', 'receptionist'), validate(updateAppointmentSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
