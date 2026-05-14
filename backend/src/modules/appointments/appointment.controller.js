const appointmentService = require('./appointment.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await appointmentService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.getById(req.params.id);
  res.json({ data: appointment });
});

const create = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.create(req.body, req.user.id);
  res.status(201).json({ data: appointment });
});

const update = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.update(req.params.id, req.body);
  res.json({ data: appointment });
});

const remove = asyncHandler(async (req, res) => {
  await appointmentService.remove(req.params.id);
  res.status(204).end();
});

module.exports = { list, getById, create, update, remove };
