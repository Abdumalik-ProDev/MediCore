const { Router } = require('express');
const controller = require('./medicalRecord.controller');
const { createMedicalRecordSchema, updateMedicalRecordSchema } = require('./medicalRecord.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'doctor'), validate(createMedicalRecordSchema), controller.create);
router.put('/:id', authorize('admin', 'doctor'), validate(updateMedicalRecordSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
