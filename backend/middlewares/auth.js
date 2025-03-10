const { USER_JWT_SECRET } = require("../config");
const JWT = require("jsonwebtoken");

function userAuth(req, res, next) {
  const token = req.headers.token;
  const decoded = JWT.verify(token, USER_JWT_SECRET);

  if (decoded) {
    req.userId = decoded.userId;
    next();
  } else {
    res.json({
      msg: "invalid token!",
    });
  }
}

// middleware/auth.js
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  // console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = JWT.verify(token, USER_JWT_SECRET);
    if (decoded.role !== 'manufacturer') {
      return res.status(403).json({ message: 'Access denied: Not a manufacturer' });
    }
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = {
    userAuth,
    auth,
};
