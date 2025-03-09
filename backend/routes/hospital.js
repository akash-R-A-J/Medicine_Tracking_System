// routes/hospital.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Hospital = require("../models/hospitalSchema");
const Equipment = require("../models/equipmentSchema");
const MaintenanceRequest = require("../models/maintenanceSchema");
const { auth } = require("../middlewares/auth");
const { USER_JWT_SECRET, SALT_ROUND } = require("../config");

const router = express.Router();

// @route   POST /api/hospital/register
// @desc    Register a new hospital
// @access  Public
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    country,
    website,
    registrationNumber,
    taxId,
    yearOfEstablishment,
    username,
    password,
  } = req.body;

  try {
    let hospital = await Hospital.findOne({ email });
    if (hospital)
      return res
        .status(400)
        .json({ message: "Hospital with this email already exists" });

    hospital = await Hospital.findOne({ username });
    if (hospital)
      return res.status(400).json({ message: "Username already taken" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    hospital = new Hospital({
      name,
      email,
      phone,
      address,
      country,
      website,
      registrationNumber,
      taxId,
      yearOfEstablishment,
      username,
      password: hashedPassword,
      role: "hospital",
    });

    await hospital.save();

    const payload = { id: hospital._id, role: hospital.role };
    const token = jwt.sign(payload, USER_JWT_SECRET);

    res
      .status(201)
      .json({ token, message: "Hospital registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/hospital/login
// @desc    Login a hospital
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hospital = await Hospital.findOne({ username });
    if (!hospital)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: hospital._id, role: hospital.role };
    const token = jwt.sign(payload, USER_JWT_SECRET);

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/hospital/equipment
// @desc    Get all equipment assigned to the hospital
// @access  Private (Hospital only)
router.get("/equipment", auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ currentOwner: req.user.id });
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/hospital/equipment/validate
// @desc    Validate equipment authenticity
// @access  Private (Hospital only)
router.post("/equipment/validate", auth, async (req, res) => {
  const { serialNumber } = req.body;

  try {
    const equipment = await Equipment.findOne({
      serialNumber,
      currentOwner: req.user.id,
    });
    if (!equipment)
      return res
        .status(404)
        .json({ message: "Equipment not found or not owned by you" });

    // Simulate blockchain validation
    equipment.status = "Validated";
    equipment.history.push({
      action: "Validated",
      user: req.user.id,
      timestamp: new Date(),
    });
    await equipment.save();

    res.json({ message: "Equipment validated successfully", equipment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/hospital/maintenance/request
// @desc    Submit a maintenance request for equipment
// @access  Private (Hospital only)
router.post("/maintenance/request", auth, async (req, res) => {
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
router.get("/maintenance", auth, async (req, res) => {
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
