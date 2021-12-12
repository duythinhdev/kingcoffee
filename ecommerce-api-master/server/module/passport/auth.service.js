const jwt = require('jsonwebtoken');

/**
 * Returns a jwt token signed by the app secret
 * increase to 22 hours
 */
exports.signToken = (id, userRoles, expireTokenDuration = 60 * 60 * 22) => jwt.sign({ _id: id, userRoles }, process.env.SESSION_SECRET, {
  expiresIn: expireTokenDuration
});

/**
 * Set token cookie directly for oAuth strategies
 */
exports.setTokenCookie = (req, res) => {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  const token = jwt.sign({ _id: req.user._id, userRoles: req.user.userRoles }, process.env.SESSION_SECRET, {
    expiresIn: 60 * 60 * 24
  });
  res.cookie('token', token);
  return res.redirect('/');
};
