const diseaseService = require('./disease.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await diseaseService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const disease = await diseaseService.getById(req.params.id);
  res.json({ data: disease });
});

const create = asyncHandler(async (req, res) => {
  const disease = await diseaseService.create(req.body);
  res.status(201).json({ data: disease });
});

const update = asyncHandler(async (req, res) => {
  const disease = await diseaseService.update(req.params.id, req.body);
  res.json({ data: disease });
});

const remove = asyncHandler(async (req, res) => {
  await diseaseService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
