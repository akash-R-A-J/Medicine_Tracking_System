import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Transaction, Connection } from "@solana/web3.js";
import { Buffer } from 'buffer';

function HospitalDashboard() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showValidateForm, setShowValidateForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [validateFormData, setValidateFormData] = useState({ serialNumber: '' });
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    equipmentId: '',
    issueDescription: '',
  });

  // on mount
  useEffect(() => {
    fetchEquipmentList();
    fetchMaintenanceRequests();
  }, []);
  
  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const fetchEquipmentList = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/hospital/equipment', {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      setEquipmentList(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/hospital/maintenance', {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      setMaintenanceRequests(response.data);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const handleValidateChange = (e) => {
    setValidateFormData({ ...validateFormData, [e.target.name]: e.target.value });
  };

  const handleMaintenanceChange = (e) => {
    setMaintenanceFormData({ ...maintenanceFormData, [e.target.name]: e.target.value });
  };

  const handleValidateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/v1/hospital/equipment/validate', validateFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
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

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/v1/hospital/maintenance/request', maintenanceFormData, {
        headers: { "x-auth-token": `${localStorage.getItem('token')}` },
      });
      alert('Maintenance request submitted successfully!');
      
      // basic cleanup
      setMaintenanceFormData({});
      setShowMaintenanceForm(false);
      fetchMaintenanceRequests();
    } catch (error) {
      console.error('Maintenance request error:', error);
      alert('Failed to submit maintenance request.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Hospital Dashboard</h2>
      
      {/* actions/functionalities */}
      <div style={{ marginBottom: '20px' }}>
        
        <Link to="/profile" style={{ padding: '10px', backgroundColor: '#6c757d', color: '#fff', textDecoration: 'none', borderRadius: '4px', display: 'inline-block' }}>
          View Profile
        </Link>
        
        <button onClick={() => { setShowValidateForm(true); setShowMaintenanceForm(false); }} style={{ padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
          Validate Equipment
        </button>
        
        <button onClick={() => { setShowMaintenanceForm(true); setShowValidateForm(false); }} style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
          Submit Maintenance Request
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

        {/* Maintenance Request list */}
      <h3 style={{ color: '#333', marginTop: '20px' }}>Maintenance Requests</h3>
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {maintenanceRequests.map((request) => (
          <li key={request._id} style={{ padding: '10px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '5px' }}>
            {request.issueDescription} (Status: {request.status})
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

      {/* maintenance request form */}
      {showMaintenanceForm && (
        <form onSubmit={handleMaintenanceSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ color: '#333' }}>Submit Maintenance Request</h3>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Equipment ID: <input type="text" name="equipmentId" value={maintenanceFormData.equipmentId} onChange={handleMaintenanceChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Issue Description: <input type="text" name="issueDescription" value={maintenanceFormData.issueDescription} onChange={handleMaintenanceChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </label>
          <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>Submit</button>
          <button type="button" onClick={() => setShowMaintenanceForm(false)} style={{ padding: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' }}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default HospitalDashboard;