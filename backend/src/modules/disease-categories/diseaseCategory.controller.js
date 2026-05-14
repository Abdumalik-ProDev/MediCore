const diseaseCategoryService = require('./diseaseCategory.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await diseaseCategoryService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const category = await diseaseCategoryService.getById(req.params.id);
  res.json({ data: category });
});

const create = asyncHandler(async (req, res) => {
  const category = await diseaseCategoryService.create(req.body);
  res.status(201).json({ data: category });
});

const update = asyncHandler(async (req, res) => {
  const category = await diseaseCategoryService.update(req.params.id, req.body);
  res.json({ data: category });
});

const remove = asyncHandler(async (req, res) => {
  await diseaseCategoryService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
