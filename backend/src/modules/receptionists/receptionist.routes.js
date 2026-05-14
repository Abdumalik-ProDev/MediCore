const { Router } = require('express');
const controller = require('./receptionist.controller');
const { createReceptionistSchema, updateReceptionistSchema } = require('./receptionist.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), controller.list);
router.get('/:id', authorize('admin'), controller.getById);
router.post('/', authorize('admin'), validate(createReceptionistSchema), controller.create);
router.put('/:id', authorize('admin'), validate(updateReceptionistSchema), controller.update);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
