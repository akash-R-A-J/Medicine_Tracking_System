// routes/distributor.js
const express = require("express");
const Distributor = require("../models/distributorSchema");
const Equipment = require("../models/equipmentSchema");
const { distributorAuth } = require("../middlewares/auth");
const { transferOwnership, validateOwnership } = require("./blockchain");
const { getEquipment } = require("../general/account");
const { signup } = require("../util/signup");
const { login } = require("../util/login");

// 4ckWGAQ5atkPviAyQpRtkAsaGGHFEv5TvxYfCKtGfxscHiVoVmHiYMxMbLWdnrxUS3V9UpWod8SgQpUxyLHRrZCa

// Blockchain related imports
const {
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
} = require("@solana/web3.js");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const router = express.Router();

/* ACCOUNT MANAGEMENT ROUTES */

// @route   POST /api/distributor/register
// @desc    Register a new distributor
// @access  Public
router.post("/register", signup);

// @route   POST /api/distributor/login
// @desc    Login a distributor
// @access  Public
router.post("/login", login);

// @route   GET /api/manufacturer/profile
// @desc    Get manufacturer profile
// @access  Private (Manufacturer only)
router.get("/profile", distributorAuth, async (req, res) => {
  try {
    const distributor = await Distributor.findById(req.user.id).select(
      "-password"
    );
    if (!distributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }
    res.json(distributor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/distributor/equipment
// @desc    Get all equipment assigned to the distributor
// @access  Private (Distributor only)
router.get("/equipment", distributorAuth, async (req, res) => {
  try {
    const equipment = await getEquipment(Distributor, req.user.id);
    if (!equipment) {
      return res.status(404).json({ message: "No equipment found" });
    }

    res.json(equipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/distributor/equipment/validate
// @desc    Validate equipment authenticity
// @access  Private (Distributor only)
router.post("/equipment/validate", distributorAuth, async (req, res) => {
  try {
    console.log("validating equipment at the backend...");
    // for now, it is validating all equipments which is transferred to this distributor
    // Get distributor's publicKey from authenticated user
    const distributor = await Distributor.findById(req.user.id);
    if (!distributor) throw new Error("Distributor not found");

    console.log(distributor);
    // Find equipment where:
    // - The latest history entry is "Transferred"
    // - The recipient in that transfer is the distributor's public key
    // const equipmentList = await Equipment.find({
    //   "history.action": "Transferred",
    //   "history.user": distributor.publicKey, // Check if distributor is the latest recipient
    // });

    const equipmentList = await Equipment.find({
      currentOwner: distributor.publicKey, // Ensure the latest recipient is still the distributor
    });

    console.log(equipmentList);

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

      console.log(lastHistoryEntry);

      // validation logic
      if (
        lastHistoryEntry.action === "Transferred" &&
        validateOwnership(lastHistoryEntry.signature, lastHistoryEntry.user)
      ) {
        // Mark equipment as validated
        equipment.status = "Validated";
        equipment.history.push({
          action: "Validated",
          user: distributor.publicKey,
          timestamp: new Date(),
        });

        console.log("updating databse...");

        await equipment.save();
        validatedEquipment.push(equipment);
      }
    }

    res.json({
      // message: `${validatedEquipment.length} equipment validated successfully`,
      message: `equipment validated successfully`,
      validatedEquipment,
    });
  } catch (error) {
    console.error("Validate equipment error:", error);
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/distributor/equipment/transfer
// @desc    Transfer equipment to a hospital
// @access  Private (Distributor only)
router.post("/equipment/transfer", distributorAuth, async (req, res) => {
  const { serialNumber, recipientPublicKey } = req.body;
  const id = req.user.id;

  try {
    // Serialize transaction to send to frontend for signing
    const serializedTransaction = await transferOwnership(
      Distributor,
      serialNumber,
      recipientPublicKey,
      id,
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
router.post("/equipment/confirm-transfer", distributorAuth, async (req, res) => {
  const { serialNumber, recipientPublicKey, signature } = req.body;

  try {
    const confirmation = await confirmTransfer(
      Distributor,
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

module.exports = router;
