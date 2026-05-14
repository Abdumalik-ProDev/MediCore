const { Router } = require('express');
const controller = require('./diagnosis.controller');
const { createDiagnosisSchema, updateDiagnosisSchema } = require('./diagnosis.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'clinician'), validate(createDiagnosisSchema), controller.create);
router.put('/:id', authorize('admin', 'clinician'), validate(updateDiagnosisSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
