const { Router } = require('express');
const controller = require('./auditLog.controller');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), controller.list);
router.get('/:id', authorize('admin'), controller.getById);

module.exports = router;
