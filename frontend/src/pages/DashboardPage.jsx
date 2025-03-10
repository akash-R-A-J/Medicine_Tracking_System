import React, { useEffect, useState } from 'react';
import ManufacturerDashboard from '../components/ManufacturerDashboard.jsx';
import DistributorDashboard from '../components/DistributorDashboard.jsx';
import HospitalDashboard from '../components/DistributorDashboard.jsx';

function DashboardPage() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const roleFromStorage = localStorage.getItem('role');
    if (roleFromStorage) {
      setRole(roleFromStorage);
    }
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}> Dashboard</h1>
      {role === 'manufacturer' && <ManufacturerDashboard />}
      {role === 'distributor' && <DistributorDashboard />}
      {role === 'hospital' && <HospitalDashboard />}
      {!role && <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>}
    </div>
  );
}

export default DashboardPage;