const { Router } = require('express');
const controller = require('./diseaseCategory.controller');
const { createDiseaseCategorySchema, updateDiseaseCategorySchema } = require('./diseaseCategory.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin'), validate(createDiseaseCategorySchema), controller.create);
router.put('/:id', authorize('admin'), validate(updateDiseaseCategorySchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
