const diseaseSuggestionService = require('./diseaseSuggestion.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await diseaseSuggestionService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const suggestion = await diseaseSuggestionService.getById(req.params.id);
  res.json({ data: suggestion });
});

const create = asyncHandler(async (req, res) => {
  const suggestion = await diseaseSuggestionService.create(req.body, req.user.id);
  res.status(201).json({ data: suggestion });
});

const review = asyncHandler(async (req, res) => {
  const suggestion = await diseaseSuggestionService.review(req.params.id, req.body, req.user.id);
  res.json({ data: suggestion });
});

const remove = asyncHandler(async (req, res) => {
  await diseaseSuggestionService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, review, remove };
