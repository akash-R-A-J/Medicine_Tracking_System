// models/Distributor.js
const mongoose = require('mongoose');

const DistributorSchema = new mongoose.Schema(
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

    // Account details
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed password
    role: { type: String, default: 'distributor' },
  },
  { timestamps: true }
);

const DistributorModel = mongoose.model("Distributor", DistributorSchema);

module.exports = DistributorModel;