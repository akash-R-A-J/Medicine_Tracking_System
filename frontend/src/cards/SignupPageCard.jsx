import React from "react";

const cardStyle = {
  padding: "20px",
  backgroundColor: "#222",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
  marginBottom: "20px",
  color: "white",
  margin: "40px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  //   border: "1px solid #ddd",
  width: "90%",
  marginTop: "5px",
};

const labelStyle = {
  fontWeight: "bold",
  marginTop: "10px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

export function Card1({ formData, handleChange, role, setRole }) {
  return (
    <div style={cardStyle}>
      <h2 style={{ color: "rgb(24, 177, 228)" }}>Basic Details</h2>
      <label style={labelStyle}>
        Role:
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={inputStyle}
        >
          <option value="manufacturer">Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="hospital">Hospital</option>
        </select>
      </label>
      <label style={labelStyle}>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Phone:
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Address:
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Country:
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
    </div>
  );
}

export function Card2({ formData, handleChange, role }) {
  return (
    <div style={cardStyle}>
      <h2 style={{ color: "rgb(24, 177, 228)" }}>Business & Registration</h2>
      <label style={labelStyle}>
        Website (optional):
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Registration Number:
        <input
          type="text"
          name="registrationNumber"
          value={formData.registrationNumber}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Tax ID:
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleChange}
          style={inputStyle}
        />
      </label>
      {(role === "manufacturer" || role === "distributor") && (
        <label style={labelStyle}>
          Year of Establishment:
          <input
            type="number"
            name="yearOfEstablishment"
            value={formData.yearOfEstablishment}
            onChange={handleChange}
            style={inputStyle}
          />
        </label>
      )}
      {role === "manufacturer" && (
        <label style={labelStyle}>
          GST Number:
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            style={inputStyle}
          />
        </label>
      )}
    </div>
  );
}

export function Card3({ formData, handleChange }) {
  return (
    <div style={cardStyle}>
      <h2 style={{ color: "rgb(24, 177, 228)" }}>Account Security</h2>
      <label style={labelStyle}>
        Username:
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Public Key:
        <input
          type="text"
          name="publicKey"
          value={formData.publicKey}
          onChange={handleChange}
          style={inputStyle}
          required
        />
      </label>
    </div>
  );
}
