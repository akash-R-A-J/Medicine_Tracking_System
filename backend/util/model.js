const Manufacturer = require("../models/manufacturerSchema");
const Distributor = require("../models/distributorSchema");
const Hospital = require("../models/hospitalSchema");

const {
  MANUFACTURER_JWT_SECRET,
  DISTRIBUTOR_JWT_SECRET,
  HOSPITAL_JWT_SECRET,
} = require("../config");

function getModel(role) {
  return role === "manufacturer"
    ? Manufacturer
    : role === "distributor"
    ? Distributor
    : Hospital;
}

function getJWT(role) {
  return role === "manufacturer"
    ? MANUFACTURER_JWT_SECRET
    : role === "distributor"
    ? DISTRIBUTOR_JWT_SECRET
    : HOSPITAL_JWT_SECRET;
}

module.exports = {
  getModel,
  getJWT,
};
