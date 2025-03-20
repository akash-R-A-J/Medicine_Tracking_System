const JWT = require("jsonwebtoken");

const {
  MANUFACTURER_JWT_SECRET,
  DISTRIBUTOR_JWT_SECRET,
  HOSPITAL_JWT_SECRET,
} = require("../config");

// auth for manufacturer
function manufacturerAuth(req, res, next){
  
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  try {
    const decoded = JWT.verify(token, MANUFACTURER_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

// auth for distributor
function distributorAuth(req, res, next){
  
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  try {
    const decoded = JWT.verify(token, DISTRIBUTOR_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

// auth for hospital
function hospitalAuth(req, res, next){
  
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  try {
    const decoded = JWT.verify(token, HOSPITAL_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

// middleware/auth.js
function auth(req, res, next) {
  const token = req.header("x-auth-token");
  const role = req.body.role;

  const JWT_SECRET = getJWT(role);

  if (!token || !role) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = JWT.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

module.exports = {
  auth,
  manufacturerAuth,
  distributorAuth,
  hospitalAuth,
};
