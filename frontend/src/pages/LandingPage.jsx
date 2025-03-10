import React from "react";
import { Link } from "react-router-dom";
import logo1 from "../assets/logo-1.webp";

// Landing Page
function LandingPage() {
  return (
    <div
      style={{
        minHeight: "92.5vh",
        padding: "20px",
        backgroundColor: "rgb(24, 177, 228)",
        alignItems: "center",
      }}
    >
      {/* Navigation Card */}
      <NavCard />

      {/* Centering the last two cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "30px",
          width: "100%",
        }}
      >
        {/* Main Content */}
        <div style={{ maxWidth: "800px", width: "100%" }}>
          <MainCard />
        </div>

        {/* Instructions */}
        <div style={{ marginTop: "20px", maxWidth: "800px", width: "100%" }}>
          <InstructionCard />
        </div>
      </div>
    </div>
  );
}

// Navigation Card
const NavCard = () => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "10px 20px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{display: "flex"}}>
        <img
          src={logo1}
          alt="Logo"
          style={{ height: "60px", borderRadius: 20 }}
        />{" "}
        <div style={{ color: "rgb(24, 177, 228)", fontSize: "32px", marginTop: 10, marginLeft: 10}}>
        Medical Equipment Tracking System
      </div>
      </div>
      <div style={{color: "rgb(24, 177, 228)",}}>
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            fontSize: "18px",
            color: "rgb(24, 177, 228)",
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          Login
        </Link>
        /
        <Link
          to="/signup"
          style={{
            textDecoration: "none",
            color: "rgb(24, 177, 228)",
            fontSize: "18px",
            fontWeight: "bold",
            marginLeft: "10px",
          }}
        >
          Signup
        </Link>
      </div>
    </div>
  );
};

// Main Content Card
const MainCard = () => {
  return (
    <div
      style={{
        // backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        // boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      {/* <h1 style={{ color: "#333", fontSize: "32px", marginBottom: "10px" }}>
        Medical Equipment Tracking System
      </h1> */}
      <p style={{ color: "white", fontSize: "20px", lineHeight: "1.6" }}>
        Welcome to our platform for tracking medical equipment across
        manufacturers, distributors, and hospitals using cutting-edge
        technology.
      </p>
    </div>
  );
};

// Instruction Card
const InstructionCard = () => {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "rgb(24, 177, 228)", fontSize: "22px", marginBottom: "10px" }}>
        How to Install Phantom
      </h2>
      <p style={{ color: "#666", fontSize: "18px", lineHeight: "1.7" }}>
        1. Visit{" "}
        <a href="https://phantom.app" style={{ color: "#007BFF" }}>
          phantom.app
        </a>{" "}
        to download the Phantom wallet.
        <br />
        2. Install the extension in your browser.
        <br />
        3. Create or import a Solana wallet to start tracking equipment on the
        blockchain (coming soon).
        <br />
        4. Connect your wallet to the Medical Equipment Tracking System.
        <br />
        5. Verify your identity and grant necessary permissions.
        <br />
        6. Start tracking and managing medical equipment securely with
        blockchain integration.
      </p>
    </div>
  );
};



export default LandingPage;
