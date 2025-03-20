// routes/hospital.js
const express = require("express");
const Hospital = require("../models/hospitalSchema");
const Equipment = require("../models/equipmentSchema");
const MaintenanceRequest = require("../models/maintenanceSchema");
const { hospitalAuth } = require("../middlewares/auth");
const { getEquipment } = require("../general/account");
const { signup } = require("../util/signup");
const { login } = require("../util/login");

const router = express.Router();

/* ACCOUNT MANAGEMENT ROUTES */

// @route   POST /api/hospital/register
// @desc    Register a new hospital
// @access  Public
router.post("/register", signup);

// @route   POST /api/hospital/login
// @desc    Login a hospital
// @access  Public
router.post("/login", login);

// @route   GET /api/manufacturer/profile
// @desc    Get manufacturer profile
// @access  Private (Manufacturer only)
router.get("/profile", hospitalAuth, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select("-password");
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* EQIPMENT MANAGEMENT */

// @route   GET /api/hospital/equipment
// @desc    Get all equipment assigned to the hospital
// @access  Private (Hospital only)
router.get("/equipment", hospitalAuth, async (req, res) => {
  try {
    const equipment = await getEquipment(Hospital, req.user.id);

    if (!equipment) {
      return res.status(404).json({ message: "No equipment found" });
    }

    res.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/hospital/equipment/validate
// @desc    Validate equipment authenticity
// @access  Private (Distributor only)
router.post("/equipment/validate", hospitalAuth, async (req, res) => {
  try {
    // for now, it is validating all equipments which is transferred to this hospital
    // Get distributor's publicKey from authenticated user
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) throw new Error("Hospital not found");

    // Find equipment where:
    // - The latest history entry is "Transferred"
    // - The recipient in that transfer is the distributor's public key
    const equipmentList = await Equipment.find({
      "history.action": "Transferred",
      "history.user": hospital.publicKey, // Check if distributor is the latest recipient
    });

    if (equipmentList.length === 0) {
      return res.status(404).json({
        message: "No transferred equipment found for validation",
      });
    }

    // Validate each eligible equipment
    let validatedEquipment = [];
    for (const equipment of equipmentList) {
      // Ensure last history entry is a transfer to this distributor
      const lastHistoryEntry = equipment.history[equipment.history.length - 1];

      if (
        lastHistoryEntry.action === "Transferred" &&
        lastHistoryEntry.user === hospital.publicKey
      ) {
        // Mark equipment as validated
        equipment.status = "In-use";
        equipment.history.push({
          action: "Validated",
          user: hospital.publicKey,
          timestamp: new Date(),
        });

        await equipment.save();
        validatedEquipment.push(equipment);
      }
    }

    res.json({
      message: `${validatedEquipment.length} equipment validated successfully`,
      validatedEquipment,
    });
  } catch (error) {
    console.error("Validate equipment error:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/hospital/maintenance/request
// @desc    Submit a maintenance request for equipment
// @access  Private (Hospital only)
router.post("/maintenance/request", hospitalAuth, async (req, res) => {
  const { equipmentId, issueDescription } = req.body;

  try {
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment || equipment.currentOwner !== req.user.id) {
      return res
        .status(404)
        .json({ message: "Equipment not found or not owned by you" });
    }

    const maintenanceRequest = new MaintenanceRequest({
      equipmentId,
      hospitalId: req.user.id,
      issueDescription,
    });

    await maintenanceRequest.save();
    res.status(201).json({
      message: "Maintenance request submitted successfully",
      maintenanceRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/hospital/maintenance
// @desc    Get all maintenance requests for the hospital
// @access  Private (Hospital only)
router.get("/maintenance", hospitalAuth, async (req, res) => {
  try {
    const maintenanceRequests = await MaintenanceRequest.find({
      hospitalId: req.user.id,
    }).populate("equipmentId");
    res.json(maintenanceRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
