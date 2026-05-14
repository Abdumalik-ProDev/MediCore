const doctorService = require('./doctor.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await doctorService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const doctor = await doctorService.getById(req.params.id);
  res.json({ data: doctor });
});

const create = asyncHandler(async (req, res) => {
  const doctor = await doctorService.create(req.body);
  res.status(201).json({ data: doctor });
});

const update = asyncHandler(async (req, res) => {
  const doctor = await doctorService.update(req.params.id, req.body);
  res.json({ data: doctor });
});

const remove = asyncHandler(async (req, res) => {
  await doctorService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
