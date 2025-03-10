import React, { useState } from "react";
import axios from "axios";
import { Card1, Card2, Card3 } from "../cards/SignupPageCard";

const containerStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: "#222",
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(255, 255, 255, 0.1)",
  marginTop: "50px",
  color: "white"
};

const tabContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px",
};

const tabStyle = (active) => ({
  flex: 1,
  padding: "12px",
  cursor: "pointer",
  textAlign: "center",
  fontWeight: "bold",
  borderRadius: "5px",
  backgroundColor: active ? "rgb(24, 177, 228)" : "#ddd",
  color: active ? "white" : "black",
  transition: "background-color 0.3s",
  margin: 5,
  fontSize: "16px",
});

const formGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const labelStyle = {
  minWidth: "150px", // Ensures labels are of equal width
  textAlign: "right",
  fontWeight: "bold",
};

const inputStyle = {
  flex: 1,
  padding: "10px",
  // border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

export default function SignupPage() {
  const [role, setRole] = useState("manufacturer");
  const [currentTab, setCurrentTab] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    website: "",
    registrationNumber: "",
    taxId: "",
    gstNumber: "",
    yearOfEstablishment: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:3000/api/v1/${role}/register`,
        formData
      );
      alert("Signup successful! Redirecting to login...");
      window.location.href = "/login";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", color: "rgb(24, 177, 228)" }}>
        Signup
      </h1>
      <div style={tabContainerStyle}>
        <div
          style={tabStyle(currentTab === 1)}
          onClick={() => setCurrentTab(1)}
        >
          Basic
        </div>
        <div
          style={tabStyle(currentTab === 2)}
          onClick={() => setCurrentTab(2)}
        >
          Business
        </div>
        <div
          style={tabStyle(currentTab === 3)}
          onClick={() => setCurrentTab(3)}
        >
          Security
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        {currentTab === 1 && (
          <Card1
            formData={formData}
            handleChange={handleChange}
            role={role}
            setRole={setRole}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            formGroupStyle={formGroupStyle}
          />
        )}
        {currentTab === 2 && (
          <Card2
            formData={formData}
            handleChange={handleChange}
            role={role}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            formGroupStyle={formGroupStyle}
          />
        )}
        {currentTab === 3 && (
          <Card3
            formData={formData}
            handleChange={handleChange}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            formGroupStyle={formGroupStyle}
          />
        )}
        {currentTab === 3 && (
          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "rgb(24, 177, 228)",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              width: "100%",
              marginTop: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Signup
          </button>
        )}
      </form>
    </div>
  );
}
