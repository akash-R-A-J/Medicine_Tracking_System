// to avoid circular dependencies
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = Number(process.env.PORT);
const SALT_ROUND = Number(process.env.SALT_ROUND);
const MANUFACTURER_JWT_SECRET = process.env.MANUFACTURER_JWT_SECRET;
const DISTRIBUTOR_JWT_SECRET = process.env.DISTRIBUTOR_JWT_SECRET;
const HOSPITAL_JWT_SECRET = process.env.HOSPITAL_JWT_SECRET;

module.exports = {
  PORT,
  MONGO_URL,
  SALT_ROUND,
  MANUFACTURER_JWT_SECRET,
  DISTRIBUTOR_JWT_SECRET,
  HOSPITAL_JWT_SECRET,
};
