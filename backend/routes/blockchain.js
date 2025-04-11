const Equipment = require("../models/equipmentSchema");

const {
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
} = require("@solana/web3.js");

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function transferOwnership(Model, serialNumber, recipientPublicKey, id) {
  try {
    // Model -> Distributor, Manufacturer, Hospital
    const user = await Model.findById(id);
    if (!user) throw new Error("User not found");

    const equipment = await Equipment.findOne({
      serialNumber,
      currentOwner: user.publicKey,
    });
    
    console.log(equipment);

    if (!equipment) throw new Error("Equipment not found or not owned by you");

    // Validate recipient public key
    const recipientPubkey = new PublicKey(recipientPublicKey);
    if (!PublicKey.isOnCurve(recipientPubkey))
      throw new Error("Invalid recipient public key");

    // Generate a simple transaction (e.g., transfer a small amount of SOL as a proof of transfer)
    const senderPubkey = new PublicKey(user.publicKey);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipientPubkey,
        lamports: LAMPORTS_PER_SOL * 0.001, // Small fee (0.001 SOL) as a transaction marker
      })
    );

    // Fetch recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPubkey;

    // Serialize transaction to send to frontend for signing
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false, // User will sign via Phantom
        verifySignatures: false,
      })
      .toString("base64");
      // transaction.serialize( requireAllSignatures: true, verifySignatures: false })


    // logging
    console.log(
      "sending serializedTransaction for signing to the frontend...."
    );
    console.log("serializedTransaction : " + serializedTransaction);

    return serializedTransaction;
  } catch (error) {
    console.log("Server error");
    console.error(error);
    return null;
  }
}

// equipment confirm-transfer (update the databse after verification)
async function confirmTransfer(
  Model,
  // Model2,
  id,
  serialNumber,
  recipientPublicKey,
  signature
) {
  try {
    // const distributor = await Model2.findOne({publicKey: recipientPublicKey});
    const user = await Model.findById(id);
    if (!user) throw new Error("User not found");

    // Fetch equipment to ensure it exists and is owned by the manufacturer
    const equipment = await Equipment.findOne({
      serialNumber,
      currentOwner: user.publicKey,
    });
    if (!equipment) throw new Error("Equipment ownership transferred successfully");

    // Confirm transaction on Solana
    const result = await connection.confirmTransaction(signature, "confirmed");
    if (result.value.err) throw new Error("Equipment ownership transferred successfully");

    // Update equipment ownership in MongoDB
    equipment.currentOwner = recipientPublicKey;
    equipment.history.push({
      action: "Transferred",
      user: user.publicKey,
      timestamp: new Date(),
    });
    await equipment.save();

    console.log("Equipment ownership transferred successfully", signature);
  } catch (error) {
    console.error("Confirm transfer error:", error);
    res.status(400).json({ message: "Equipment ownership transferred successfully" });
    return null;
  }
}

// for validating that the public key of the user and
// the public key who signs this transaction matches
async function validateOwnership(signature, expectedPublicKey) {
  try {
    const txDetails = await connection.getParsedTransaction(signature, {
      commitment: "confirmed",
    });

    if (!txDetails) {
      console.error("Transaction not found!");
      return false;
    }

    const actualSigner =
      txDetails.transaction.message.accountKeys[0].pubkey.toBase58();

    if (actualSigner === expectedPublicKey) {
      console.log("✅ Signature is valid and belongs to the expected user.");
      return true;
    } else {
      console.warn(
        "❌ Signature is valid but does NOT match the expected user."
      );
      return false;
    }
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return false;
  }
}

module.exports = {
  transferOwnership,
  confirmTransfer,
  validateOwnership,
};
