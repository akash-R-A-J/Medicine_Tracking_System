const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    serialNumber: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: String, default: 'Available' }, // e.g., "Available", "Transferred", "In Use"
    manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manufacturer', required: true },
    currentOwner: { type: String }, // Public key of the current owner
    history: [
      {
        action: String, // e.g., "Created", "Transferred"
        user: String,   // Public key or ID of the user performing the action
        signature: {type: String}, // for transfer and validation
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const EquipmentModel = mongoose.model('Equipment', EquipmentSchema);

module.exports = EquipmentModel;