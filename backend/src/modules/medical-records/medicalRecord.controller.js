const medicalRecordService = require('./medicalRecord.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await medicalRecordService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const record = await medicalRecordService.getById(req.params.id);
  res.json({ data: record });
});

const create = asyncHandler(async (req, res) => {
  const record = await medicalRecordService.create(req.body);
  res.status(201).json({ data: record });
});

const update = asyncHandler(async (req, res) => {
  const record = await medicalRecordService.update(req.params.id, req.body);
  res.json({ data: record });
});

const remove = asyncHandler(async (req, res) => {
  await medicalRecordService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
