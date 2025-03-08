const express = require("express");
const router = express.Router();
const { userAuth } = require("../middlewares/auth");
const { UserModel, EquipmentModel, EquipmentHistoryModel } = require("../db");

// dashboard
router.post("/", userAuth, async (req, res) => {});

// profile
router.get("/profile", userAuth, async (req, res) => {
  let userId = req.userId;

  const user = await UserModel.findOne({
    _id: userId,
  });

  if (user) {
    res.status(200).json({
      user: user,
    });
  } else {
    res.json({
      msg: "user not found!",
    });
  }
});

// equipment history
// currently finding based on the userId as previous owner
router.get("/equipment-history", userAuth, async (req, res) => {
  const userId = req.userId;
  try {
    const history = await EquipmentHistoryModel.find({
      previousOwner: userId,
    });

    if (history) {
      res.status(200).json({
        history: history,
      });
    } else {
      res.json({
        msg: "equipment history not found!",
      });
    }
  } catch (e) {
    res.json({
      msg: "error finding equipment details",
      error: e.message,
    });
    console.log("error finding equipment details.", e.message);
  }
});

// add-new-item
router.post("/add-new-item", userAuth, async (req, res) => {
  const userId = req.userId;
  const { name, serialNumber } = req.body;

  try {
    const id = await EquipmentModel.create({
      name,
      serialNumber,
      manufacturer: userId,
      currentOwner: userId,
    });

    res.status(200).json({
      msg: "item added successfully.",
      id: id,
    });
  } catch (e) {
    res.json({
      msg: "error adding item",
      error: e.message,
    });
    console.log("error adding item", e.message);
  }
});

// transfer-ownership
router.post("/transfer-ownership", (req, res) => {});
