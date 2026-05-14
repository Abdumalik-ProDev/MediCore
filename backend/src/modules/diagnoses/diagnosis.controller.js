const diagnosisService = require('./diagnosis.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await diagnosisService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const diagnosis = await diagnosisService.getById(req.params.id);
  res.json({ data: diagnosis });
});

const create = asyncHandler(async (req, res) => {
  const diagnosis = await diagnosisService.create(req.body);
  res.status(201).json({ data: diagnosis });
});

const update = asyncHandler(async (req, res) => {
  const diagnosis = await diagnosisService.update(req.params.id, req.body);
  res.json({ data: diagnosis });
});

const remove = asyncHandler(async (req, res) => {
  await diagnosisService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
