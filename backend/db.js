// const mongoose = require("mongoose");
// const { string } = require("zod");
// const ObjectId = mongoose.Schema.Types.ObjectId;

// // user schema
// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: {type: String, required: true, unique: true},
//   password: { type: String, required: true },
//   role: {
//     type: String,
//     enum: ["manufacturer", "distributor", "hospital", "store"],
//     required: true,
//   },
//   walletAddress: { type: String }, // Solana wallet
//   createdAt: { type: Date, default: Date.now },
// });

// // equipment schema
// const EquipmentSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   serialNumber: { type: String, required: true, unique: true },
//   manufacturer: { type: ObjectId, ref: "User", required: true }, // Manufacturer ID
//   currentOwner: { type: ObjectId, ref: "User", required: true }, // Distributor/Hospital/Store
//   status: {
//     type: String,
//     enum: ["available", "in-transit", "delivered"],
//     default: "available",
//   },
//   blockchainTxId: { type: String }, // Solana blockchain transaction ID : required: true
//   createdAt: { type: Date, default: Date.now },
// });

// // transfer schema -> tracks ownership transfer request
// const TransferSchema = new mongoose.Schema({
//   equipment: { type: ObjectId, ref: "Equipment", required: true },
//   from: { type: ObjectId, ref: "User", required: true },
//   to: { type: ObjectId, ref: "User", required: true },
//   status: {
//     type: String,
//     enum: ["pending", "approved", "rejected"],
//     default: "pending",
//   },
//   blockchainTxId: { type: String }, // Populated when approved
//   createdAt: { type: Date, default: Date.now },
// });

// // equipment history schema -> logs all previous owner
// const EquipmentHistorySchema = new mongoose.Schema({
//   equipment: { type: ObjectId, ref: "Equipment", required: true },
//   previousOwner: { type: ObjectId, ref: "User", required: true },
//   newOwner: { type: ObjectId, ref: "User", required: true },
//   blockchainTxId: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
// });

// // blockchain transaction schema -> logs all transaction
// const BlockchainTransactionSchema = new mongoose.Schema({
//   walletAddress: { type: String, required: true },
//   txId: { type: String, required: true, unique: true },
//   type: {
//     type: String,
//     enum: ["mint", "transfer"],
//     required: true,
//   },
//   amount: { type: Number, required: true }, // SOL amount transferred
//   timestamp: { type: Date, default: Date.now },
// });

// // models of all above mentioned schemas
// const UserModel = mongoose.model("User", UserSchema);
// const EquipmentModel = mongoose.model("Equipment", EquipmentSchema);
// const TransferModel = mongoose.model("Transfer", TransferSchema);
// const EquipmentHistoryModel = mongoose.model(
//   "EquipmentHistory",
//   EquipmentHistorySchema
// );
// const BlockchainTransactionModel = mongoose.model(
//   "BlockchainTransaction",
//   BlockchainTransactionSchema
// );

// module.exports = {
//   UserModel,
//   EquipmentModel,
//   TransferModel,
//   EquipmentHistoryModel,
//   BlockchainTransactionModel,
// };
