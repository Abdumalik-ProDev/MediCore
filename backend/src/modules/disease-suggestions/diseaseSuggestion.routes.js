const { Router } = require('express');
const controller = require('./diseaseSuggestion.controller');
const { createSuggestionSchema, reviewSuggestionSchema } = require('./diseaseSuggestion.validation');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/auth');
const authorize = require('../../common/middleware/rbac');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', authorize('admin', 'doctor'), validate(createSuggestionSchema), controller.create);
router.put('/:id/review', authorize('admin'), validate(reviewSuggestionSchema), controller.review);
router.delete('/:id', authorize('admin'), controller.remove);

module.exports = router;
