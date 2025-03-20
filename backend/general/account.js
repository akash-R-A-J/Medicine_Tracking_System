const Equipment = require("../models/equipmentSchema");

// return the list of equipments that user have
async function getEquipment(Model, id){
    
    try {
        
        const user = await Model.findById(id);
        if (!user) {
            console.log("User not found.");
            return null; // Return null if user is not found
        }
        
        const equipment = await Equipment.find({
            currentOwner: user.publicKey,
        });
        
        if (!equipment || equipment.length === 0) {
            console.log("No equipment found.");
            return null;
        }
        
        return equipment;
    } catch(error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    getEquipment,
}