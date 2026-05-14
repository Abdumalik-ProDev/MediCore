const { Router } = require('express');
const controller = require('./patient.controller');
const { createPatientSchema, updatePatientSchema } = require('./patient.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.get('/:id/profile', controller.getProfile);
router.post('/', authorize('admin', 'receptionist'), validate(createPatientSchema), controller.create);
router.put('/:id', authorize('admin', 'clinician'), validate(updatePatientSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
