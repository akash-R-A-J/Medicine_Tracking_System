const express = require("express");
const router = express.Router();
const {TransferModel, EquipmentModel} = require("../db");

// ✅ Create a transfer request
router.post("/", async (req, res) => {
  try {
    const { equipment, from, to } = req.body;
    const transfer = new TransferModel({ equipment, from, to });
    await transfer.save();
    res.status(201).json({ message: "Transfer request created", transfer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all transfers
router.get("/", async (req, res) => {
  const transfers = await TransferModel.find().populate("equipment from to");
  res.json(transfers);
});

// ✅ Approve transfer (Update ownership)
router.put("/:id/approve", async (req, res) => {
  const transfer = await TransferModel.findById(req.params.id);
  if (!transfer) return res.status(404).json({ error: "Transfer not found" });

  transfer.status = "approved";
  await transfer.save();

  // Update equipment ownership
  await EquipmentModel.findByIdAndUpdate(transfer.equipment, { currentOwner: transfer.to });

  res.json({ message: "Transfer approved", transfer });
});

// ✅ Reject transfer
router.put("/:id/reject", async (req, res) => {
  const transfer = await TransferModel.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json({ message: "Transfer rejected", transfer });
});

// ✅ Delete transfer
router.delete("/:id", async (req, res) => {
  await TransferModel.findByIdAndDelete(req.params.id);
  res.json({ message: "Transfer request deleted" });
});

module.exports = router;
