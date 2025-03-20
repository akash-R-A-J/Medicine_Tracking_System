const express = require("express");
const bcrypt = require("bcrypt");
const Manufacturer = require("../models/manufacturerSchema");
const Equipment = require("../models/equipmentSchema");
const { manufacturerAuth } = require("../middlewares/auth");
const { SALT_ROUND } = require("../config");
const { transferOwnership, confirmTransfer } = require("../routes/blockchain");
const { addEquipment } = require("../general/equipment");
const { signup } = require("../util/signup");
const { login } = require("../util/login");

const router = express.Router();

/* ACCOUNT MANAGEMENT ROUTES */

// @route   POST /api/manufacturer/register
// @desc    Register a new manufacturer
// @access  Public
router.post("/register", signup);

// @route   POST /api/manufacturer/login
// @desc    Login a manufacturer
// @access  Public
router.post("/login", login);

// @route   GET /api/manufacturer/profile
// @desc    Get manufacturer profile
// @access  Private (Manufacturer only)
router.get("/profile", manufacturerAuth, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findById(req.user.id).select(
      "-password"
    );
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }
    res.json(manufacturer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/manufacturer/profile
// @desc    Update manufacturer profile
// @access  Private (Manufacturer only)
router.put("/profile", manufacturerAuth, async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    country,
    website,
    registrationNumber,
    taxId,
    gstNumber,
    yearOfEstablishment,
  } = req.body;

  try {
    const manufacturer = await Manufacturer.findById(req.user.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }

    // Update fields
    manufacturer.name = name || manufacturer.name;
    manufacturer.email = email || manufacturer.email;
    manufacturer.phone = phone || manufacturer.phone;
    manufacturer.address = address || manufacturer.address;
    manufacturer.country = country || manufacturer.country;
    manufacturer.website = website || manufacturer.website;
    manufacturer.registrationNumber =
      registrationNumber || manufacturer.registrationNumber;
    manufacturer.taxId = taxId || manufacturer.taxId;
    manufacturer.gstNumber = gstNumber || manufacturer.gstNumber;
    manufacturer.yearOfEstablishment =
      yearOfEstablishment || manufacturer.yearOfEstablishment;

    await manufacturer.save();
    res.json({ message: "Profile updated successfully", manufacturer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/manufacturer/change-password
// @desc    Change manufacturer password
// @access  Private (Manufacturer only)
router.post("/change-password", manufacturerAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const manufacturer = await Manufacturer.findById(req.user.id);
    if (!manufacturer) {
      return res.status(404).json({ message: "Manufacturer not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      manufacturer.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    manufacturer.password = await bcrypt.hash(newPassword, SALT_ROUND);

    await manufacturer.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* EQUIPMENT MANAGEMENT */

// @route   POST /api/manufacturer/equipment/add
// @desc    Add new equipment
// @access  Private (Manufacturer only)
router.post("/equipment/add", manufacturerAuth, addEquipment);

// @route   GET /api/manufacturer/equipment
// @desc    Get all equipment created by the manufacturer
// @access  Private (Manufacturer only)
router.get("/equipment", manufacturerAuth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ manufacturerId: req.user.id });
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/manufacturer/equipment/transfer
// @desc    Transfer equipment ownership to a new owner (e.g., Distributor)
// @access  Private (Manufacturer only)
router.post("/equipment/transfer", manufacturerAuth, async (req, res) => {
  const { serialNumber, recipientPublicKey } = req.body;

  try {
    // Serialize transaction to send to frontend for signing
    const serializedTransaction = await transferOwnership(
      Manufacturer,
      serialNumber,
      recipientPublicKey
    );

    if (!serializedTransaction) {
      res.status(400).json({ "error:": "invalid serialized transaction" });
      return;
    }

    res.json({ transaction: serializedTransaction });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/manufacturer/equipment/confirm-transfer
// @desc    POST equipment confirm-transfer (update the databse after verification)
// @access  Private (Manufacturer only)
router.post("/equipment/confirm-transfer", manufacturerAuth, async (req, res) => {
  const { serialNumber, recipientPublicKey, signature } = req.body;

  try {
    const confirmation = await confirmTransfer(
      Manufacturer,
      res.user.id,
      serialNumber,
      recipientPublicKey,
      signature
    );

    if (!confirmation) {
      res.status(400).json({ error: "Transaction confirmation failed" });
      return;
    }

    res.json({
      message: "Equipment ownership transferred successfully",
      signature,
    });
  } catch (error) {
    console.error("Confirm transfer error:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/manufacturer/compliance-logs
// @desc    Get compliance logs (simplified as equipment history for now)
// @access  Private (Manufacturer only)
router.get("/compliance-logs", manufacturerAuth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ manufacturerId: req.user.id });
    const logs = equipment.flatMap((item) =>
      item.history.map((entry) => ({
        serialNumber: item.serialNumber,
        action: entry.action,
        user: entry.user,
        timestamp: entry.timestamp,
      }))
    );
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
