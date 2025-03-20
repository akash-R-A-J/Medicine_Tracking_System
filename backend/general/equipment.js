const Equipment = require("../models/equipmentSchema");
const Manufacturer = require("../models/manufacturerSchema");

// endpoint handler
async function addEquipment(req, res) {
  const { name, serialNumber, description } = req.body;

  try {
    // check if equipment already exist
    let equipment = await Equipment.findOne({ serialNumber });
    if (equipment) {
      res.status(400).json({ message: "Equipment already exists" });
      return;
    }

    // check if manufacturer exist or not
    const manufacturer = await Manufacturer.findById(req.user.id);
    if (!manufacturer) {
      res.status(400).json({ message: "Manufacturer not found." });
      return;
    }

    // create and save the equipment
    equipment = new Equipment({
      name,
      serialNumber,
      description,
      status: "Available",
      manufacturerId: req.user.id,
      currentOwner: manufacturer.publicKey,
      history: [{ action: "Created", user: manufacturer.publicKey }],
    });

    await equipment.save();

    res.status(201).json({
      message: "Equipment added successfully",
      equipment,
    });
  } catch (error) {
    console.error("Error while adding equipment: ", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  addEquipment,
};
