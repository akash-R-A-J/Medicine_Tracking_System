const express = require("express");
const router = express.Router();
const { EquipmentModel } = require("../db");

// ✅ Register new equipment
router.post("/", async (req, res) => {
  try {
    const { name, serialNumber, manufacturer, currentOwner, blockchainTxId } =
      req.body;
    const equipment = new EquipmentModel({
      name,
      serialNumber,
      manufacturer,
      currentOwner,
      blockchainTxId,
    });
    await equipment.save();
    res.status(201).json({ message: "Equipment registered", equipment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all equipment
router.get("/", async (req, res) => {
  const equipment = await EquipmentModel.find().populate(
    "manufacturer currentOwner"
  );
  res.json(equipment);
});

// ✅ Get equipment by ID
router.get("/:id", async (req, res) => {
  const equipment = await EquipmentModel.findById(req.params.id).populate(
    "manufacturer currentOwner"
  );
  res.json(equipment);
});

// ✅ Update equipment status
router.put("/:id", async (req, res) => {
  const equipment = await EquipmentModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json({ message: "Equipment updated", equipment });
});

// ✅ Delete equipment
router.delete("/:id", async (req, res) => {
  await EquipmentModel.findByIdAndDelete(req.params.id);
  res.json({ message: "Equipment deleted" });
});

module.exports = router;
