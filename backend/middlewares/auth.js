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

module.exports = {
    userAuth,
};
