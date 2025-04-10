import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Transaction, Connection } from "@solana/web3.js";
import { Buffer } from "buffer";

// git push hard -> completed transaction endpoints

function ManufacturerDashboard() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    serialNumber: "",
    description: "",
  });
  const [transferFormData, setTransferFormData] = useState({
    serialNumber: "",
    recipientPublicKey: "",
  });

  // on mount
  useEffect(() => {
    fetchEquipmentList();
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    // Clear token and role from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Redirect to login page
    navigate("/");
  };

  const fetchEquipmentList = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/manufacturer/equipment",
        {
          headers: { "x-auth-token": `${localStorage.getItem("token")}` },
        }
      );
      setEquipmentList(response.data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleTransferChange = (e) => {
    setTransferFormData({
      ...transferFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/api/v1/manufacturer/equipment/add",
        addFormData,
        {
          headers: { "x-auth-token": `${localStorage.getItem("token")}` },
        }
      );
      alert("Equipment added successfully!");

      // basic cleanup
      setShowAddForm(false);
      setAddFormData({});
      fetchEquipmentList();
    } catch (error) {
      console.error("Add equipment error:", error);
      alert("Failed to add equipment.");
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/manufacturer/equipment/transfer",
        transferFormData,
        {
          headers: { "x-auth-token": `${localStorage.getItem("token")}` },
        }
      );

      const { transaction } = response.data; // ✅ Fix: response.transaction → response.data.transaction

      // Convert base64 string to Transaction object
      const transactionBuffer = Buffer.from(transaction, "base64");
      const transactionObj = Transaction.from(transactionBuffer);

      console.log("Fee payer:", transactionObj.feePayer?.toBase58()); // Added `?` to avoid potential undefined
      console.log("Instructions:", transactionObj.instructions);
      console.log("Signatures before signing:", transactionObj.signatures);

      // Assuming Phantom Wallet is installed and detected
      const provider = window.solana;
      if (!provider?.isPhantom) {
        alert("Please install Phantom Wallet extension.");
        return;
      }

      await provider.connect(); // Connect to Phantom Wallet

      console.log("Phantom pop-up...");
      console.log("Transaction to sign:", transactionObj);
      console.log("Instructions:", transactionObj.instructions);
      console.log("Fee Payer:", transactionObj.feePayer.toBase58());
      console.log("Recent Blockhash:", transactionObj.recentBlockhash);
      // -------------------------------
      // if (userPublicKey !== transactionFeePayer) {
      //   alert("Connected wallet does not match the transaction's fee payer.");
      //   return;
      // }

      // Sign the transaction (ERROR????????)
      const signedTransaction = await provider.signTransaction(transactionObj);
      console.log("Signed transaction:", signedTransaction);

      // Send the signed transaction to the Solana network
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      console.log("Transaction signature:", signature);
      alert(`Transaction signed and sent! Signature: ${signature}`);

      // Confirm the transaction in backend
      const res = await axios.post(
        "http://localhost:3000/api/v1/manufacturer/equipment/confirm-transfer",
        {
          serialNumber: transferFormData.serialNumber,
          recipientPublicKey: transferFormData.recipientPublicKey,
          signature,
        },
        {
          headers: { "x-auth-token": `${localStorage.getItem("token")}` },
        }
      );

      alert(res.data.message);

      // Cleanup
      setTransferFormData({});
      setShowTransferForm(false);
      fetchEquipmentList();
    } catch (error) {
      console.error("Transfer equipment error:", error);
      alert("Failed to transfer equipment. Check Phantom Wallet for approval.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#333", marginBottom: "20px" }}>
        Manufacturer Dashboard
      </h2>

      {/* actions/functionalities */}
      <div style={{ marginBottom: "20px" }}>
        <Link
          to="/profile"
          style={{
            padding: "9px",
            backgroundColor: "#6c757d",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            display: "inline-block",
            marginRight: "10px",
          }}
        >
          View Profile
        </Link>

        <button
          onClick={() => {
            setShowAddForm(true);
            setShowTransferForm(false);
          }}
          style={{
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Add Equipment
        </button>

        <button
          onClick={() => {
            setShowTransferForm(true);
            setShowAddForm(false);
          }}
          style={{
            padding: "10px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Transfer Equipment
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: "10px",
            backgroundColor: "red",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Logout
        </button>
      </div>

      {/* equipment list */}
      <h3 style={{ color: "#333", marginTop: "40px" }}>Equipment List</h3>
      <ul style={{ listStyle: "none", padding: "0" }}>
        {equipmentList.map((item) => (
          <li
            key={item._id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
              marginBottom: "5px",
            }}
          >
            {item.name} (Serial: {item.serialNumber})
          </li>
        ))}
      </ul>

      {/* add eqipment form*/}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h3 style={{ color: "#333" }}>Add Equipment</h3>
          <label style={{ display: "flex", flexDirection: "column" }}>
            Item Name:{" "}
            <input
              type="text"
              name="name"
              value={addFormData.name}
              onChange={handleAddChange}
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            Serial Number:{" "}
            <input
              type="text"
              name="serialNumber"
              value={addFormData.serialNumber}
              onChange={handleAddChange}
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            Description:{" "}
            <input
              type="text"
              name="description"
              value={addFormData.description}
              onChange={handleAddChange}
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            style={{
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* transfer equipment form */}
      {showTransferForm && (
        <form
          onSubmit={handleTransferSubmit}
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <h3 style={{ color: "#333" }}>Transfer Equipment</h3>
          <label style={{ display: "flex", flexDirection: "column" }}>
            Serial Number:{" "}
            <input
              type="text"
              name="serialNumber"
              value={transferFormData.serialNumber}
              onChange={handleTransferChange}
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column" }}>
            Recipient Public Key:{" "}
            <input
              type="text"
              name="recipientPublicKey"
              value={transferFormData.recipientPublicKey}
              onChange={handleTransferChange}
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Transfer
          </button>
          <button
            type="button"
            onClick={() => setShowTransferForm(false)}
            style={{
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default ManufacturerDashboard;
