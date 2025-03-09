// routes/distributor.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Distributor = require("../models/distributorSchema");
const Equipment = require("../models/equipmentSchema");
const auth = require("../middlewares/auth");
// const { Connection } = require("@solana/web3.js");

// const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const router = express.Router();

/* ACCOUNT MANAGEMENT ROUTES */

// @route   POST /api/distributor/register
// @desc    Register a new distributor
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
    let distributor = await Distributor.findOne({ email });
    if (distributor)
      return res
        .status(400)
        .json({ message: "Distributor with this email already exists" });

    distributor = await Distributor.findOne({ username });
    if (distributor)
      return res.status(400).json({ message: "Username already taken" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    distributor = new Distributor({
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
      role: "distributor",
    });

    await distributor.save();

    const payload = { id: distributor._id, role: distributor.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({ token, message: "Distributor registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/distributor/login
// @desc    Login a distributor
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const distributor = await Distributor.findOne({ username });
    if (!distributor)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, distributor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: distributor._id, role: distributor.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/distributor/equipment
// @desc    Get all equipment assigned to the distributor
// @access  Private (Distributor only)
router.get("/equipment", auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ currentOwner: req.user.id });
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/distributor/equipment/validate
// @desc    Validate equipment authenticity
// @access  Private (Distributor only)
router.post("/equipment/validate", auth, async (req, res) => {
  const { serialNumber } = req.body;

  try {
    const equipment = await Equipment.findOne({ serialNumber });
    if (!equipment)
      return res.status(404).json({ message: "Equipment not found" });

    // Simulate blockchain validation (replace with Solana logic)
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

// @route   POST /api/distributor/equipment/transfer
// @desc    Transfer equipment to a hospital
// @access  Private (Distributor only)
router.post("/equipment/transfer", auth, async (req, res) => {
  const { serialNumber, newOwnerPublicKey } = req.body;

  try {
    const equipment = await Equipment.findOne({
      serialNumber,
      currentOwner: req.user.id,
    });
    if (!equipment)
      return res
        .status(404)
        .json({ message: "Equipment not found or not owned by you" });

    // Simulate Solana ownership transfer
    equipment.currentOwner = newOwnerPublicKey;
    equipment.status = "Transferred";
    equipment.history.push({
      action: "Transferred",
      user: req.user.id,
      timestamp: new Date(),
    });
    await equipment.save();

    res.json({
      message: "Equipment ownership transferred successfully",
      equipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
