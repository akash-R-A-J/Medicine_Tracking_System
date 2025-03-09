// models/Hospital.js
const mongoose = require("mongoose");

const HospitalSchema = new mongoose.Schema(
  {
    // Basic details
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    country: { type: String, required: true },
    website: { type: String },

    // Business and registration details
    registrationNumber: { type: String, unique: true },
    taxId: { type: String, unique: true },
    yearOfEstablishment: { type: Number },
    publicKey: {type: String},

    // Account details
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    role: { type: String, default: "hospital" }, // can be store
  },
  { timestamps: true }
);

const HospitalModel = mongoose.model("Hospital", HospitalSchema);

module.exports = HospitalModel;
