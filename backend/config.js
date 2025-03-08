// to avoid circular dependencies
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;
const PORT = Number(process.env.PORT);
const SALT_ROUND = Number(process.env.SALT_ROUND);
const USER_JWT_SECRET = process.env.USER_JWT_SECRET;

module.exports = {
  PORT,
  MONGO_URL,
  SALT_ROUND,
  USER_JWT_SECRET
};
