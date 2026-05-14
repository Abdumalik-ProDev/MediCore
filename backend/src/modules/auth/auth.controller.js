const authService = require('./auth.service');
const asyncHandler = require('../../common/utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.json({ data: user });
});

module.exports = { login, getMe };
