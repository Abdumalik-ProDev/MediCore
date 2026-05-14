const receptionistService = require('./receptionist.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await receptionistService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const receptionist = await receptionistService.getById(req.params.id);
  res.json({ data: receptionist });
});

const create = asyncHandler(async (req, res) => {
  const receptionist = await receptionistService.create(req.body);
  res.status(201).json({ data: receptionist });
});

const update = asyncHandler(async (req, res) => {
  const receptionist = await receptionistService.update(req.params.id, req.body);
  res.json({ data: receptionist });
});

const remove = asyncHandler(async (req, res) => {
  await receptionistService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
