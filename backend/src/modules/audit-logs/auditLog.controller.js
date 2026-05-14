const auditLogService = require('./auditLog.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const result = await auditLogService.list(req.query);
  res.json(result);
});

const getById = asyncHandler(async (req, res) => {
  const log = await auditLogService.getById(req.params.id);
  res.json({ data: log });
});

module.exports = { list, getById };
