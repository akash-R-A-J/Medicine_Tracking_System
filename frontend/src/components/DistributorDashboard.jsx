import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Transaction, Connection } from "@solana/web3.js";
import { Buffer } from 'buffer';

function DistributorDashboard() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [showValidateForm, setShowValidateForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [validateFormData, setValidateFormData] = useState({ serialNumber: '' });
  const [transferFormData, setTransferFormData] = useState({
    serialNumber: '',
    recipientPublicKey: '',
  });

  // on mount
  useEffect(() => {
    fetchEquipmentList();
  }, []);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const fetchEquipmentList = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/distributor/equipment', {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      setEquipmentList(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleValidateChange = (e) => {
    setValidateFormData({ ...validateFormData, [e.target.name]: e.target.value });
  };

  const handleTransferChange = (e) => {
    setTransferFormData({ ...transferFormData, [e.target.name]: e.target.value });
  };

  const handleValidateSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("validating equipment on the frontend....")
      const response = await axios.post('http://localhost:3000/api/v1/distributor/equipment/validate', validateFormData, {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      alert(response.data.message);
      
      // basic cleanup
      setShowValidateForm(false);
      setValidateFormData({});
    } catch (error) {
      console.error('Validate equipment error:', error);
      alert('Failed to validate equipment.');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/distributor/equipment/transfer', transferFormData, {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      const { transaction } = response.data; // base64 string
      
      // Convert base64 string to Transaction object
      const transactionBuffer = Buffer.from(transaction, "base64");
      const transactionObj = Transaction.from(transactionBuffer);
      
      // Assuming Phantom Wallet is installed and detected
      const provider = window.solana; // Phantom Wallet provider
      if (!provider) {
        alert('Please install Phantom Wallet extension.');
        return;
      }
      await provider.connect(); // Connect to Phantom Wallet
      
      // logs for debugging
      console.log("phantom pop-up...");
      console.log("transaction to sign: " + transactionObj);
      console.log(typeof transactionObj);
      
      // send signature to the backend for verification
      const signedTransaction = await provider.signTransaction(transactionObj);
      console.log("signedTransaction: " + signedTransaction);
      
      // send the signed transaction to the solana network
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      // const signature = await provider.sendTransaction(signedTransaction);
      console.log("signature: " + signature);
      alert(`Transaction signed and sent! Signature: ${signature}`);
      
      // verifying the signature and updating the database at the backend
      const res = await axios.post("http://localhost:3000/api/v1/distributor/equipment/confirm-transfer",{
        serialNumber: transferFormData.serialNumber,
        recipientPublicKey: transferFormData.recipientPublicKey,
        signature,
      }, {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      alert(res.data.message);
      
      // basic cleanup
      setTransferFormData({});
      setShowTransferForm(false);
      fetchEquipmentList();
    } catch (error) {
      console.error('Transfer equipment error:', error);
      alert('Failed to transfer equipment. Check Phantom Wallet for approval.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Distributor Dashboard</h2>
      
      {/* actions/functionalities */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/profile" style={{ padding: '8px', backgroundColor: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'inline-block', marginRight: 10 }}>
          View Profile
        </Link>
        
        <button onClick={() => { setShowValidateForm(true); setShowTransferForm(false); }} style={{ padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
          Validate Equipment
        </button>
        
        <button onClick={() => { setShowTransferForm(true); setShowValidateForm(false); }} style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
          Transfer Equipment
        </button>
        
        <button
          onClick={handleLogout}
          style={{ padding: '10px', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      {/* equipment list */}
      <h3 style={{ color: '#333', marginTop: '30px' }}>Equipment List</h3>
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {equipmentList.map((item) => (
          <li key={item._id} style={{ padding: '10px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '5px' }}>
            {item.name} (Serial: {item.serialNumber})
          </li>
        ))}
      </ul>

        {/* validate equipment */}
      {showValidateForm && (
        <form onSubmit={handleValidateSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#333' }}>Validate Equipment</h3>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Serial Number: <input type="text" name="serialNumber" value={validateFormData.serialNumber} onChange={handleValidateChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>Validate</button>
          <button type="button" onClick={() => setShowValidateForm(false)} style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>
            Cancel
          </button>
        </form>
      )}

      {/* transfer equipment form */}
      {showTransferForm && (
        <form onSubmit={handleTransferSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#333' }}>Transfer Equipment</h3>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Serial Number: <input type="text" name="serialNumber" value={transferFormData.serialNumber} onChange={handleTransferChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Recipient Public Key: <input type="text" name="recipientPublicKey" value={transferFormData.recipientPublicKey} onChange={handleTransferChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>Transfer</button>
          <button type="button" onClick={() => setShowTransferForm(false)} style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default DistributorDashboard;