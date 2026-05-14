const { Router } = require('express');
const controller = require('./disease.controller');
const { createDiseaseSchema, updateDiseaseSchema } = require('./disease.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin'), validate(createDiseaseSchema), controller.create);
router.put('/:id', authorize('admin'), validate(updateDiseaseSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
