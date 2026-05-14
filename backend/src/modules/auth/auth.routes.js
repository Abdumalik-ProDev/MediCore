const { Router } = require('express');
const controller = require('./auth.controller');
const { loginSchema } = require('./auth.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');

const router = Router();

router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.getMe);

module.exports = router;
