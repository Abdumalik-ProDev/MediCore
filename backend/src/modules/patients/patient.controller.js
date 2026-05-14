const patientService = require('./patient.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await patientService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const patient = await patientService.getById(req.params.id);
  res.json({ data: patient });
});

const getProfile = asyncHandler(async (req, res) => {
  const profile = await patientService.getProfile(req.params.id);
  res.json({ data: profile });
});

const create = asyncHandler(async (req, res) => {
  const patient = await patientService.create(req.body);
  res.status(201).json({ data: patient });
});

const update = asyncHandler(async (req, res) => {
  const patient = await patientService.update(req.params.id, req.body);
  res.json({ data: patient });
});

const remove = asyncHandler(async (req, res) => {
  await patientService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, getProfile, create, update, remove };
