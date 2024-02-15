const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send('Access Denied! No token provided');
  }

  try {
    const payload = jwt.verify(token, req.config.secret);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).send('Invalid Token : ' + error);
  }
};

module.exports = {
  verifyJWT,
};
