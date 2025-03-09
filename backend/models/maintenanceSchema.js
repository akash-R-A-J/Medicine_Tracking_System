// Maintenance Request Schema
const mongoose = require("mongoose");

const MaintenanceRequestSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  issueDescription: { type: String, required: true },
  status: { type: String, default: "Pending" }, // e.g., "Pending", "In Progress", "Resolved"
  timestamp: { type: Date, default: Date.now },
});

const MaintenanceRequestModel = mongoose.model(
  "MaintenanceRequest",
  MaintenanceRequestSchema
);

module.exports = MaintenanceRequestModel;
