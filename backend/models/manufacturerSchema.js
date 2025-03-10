const mongoose = require("mongoose");
const { type } = require("os");

const ManufacturerSchema = new mongoose.Schema(
  {
    // basic details
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    website: { type: String },

    // business and registration details
    registrationNumber: { type: String, unique: true },
    taxId: { type: String, unique: true },
    gstNumber: { type: String },
    yearOfEstablishment: { type: Number },
    publicKey: {type: String},

    // account details
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    role: { type: String, default: "manufacturer" },
    publicKey: {type: String},
  },
  { timestamps: true }
);

const ManufacturerModel = mongoose.model("Manufacturer", ManufacturerSchema);

module.exports = ManufacturerModel;
