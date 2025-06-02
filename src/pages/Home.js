import React from "react";
import { Link } from "react-router-dom";
import appLogo from "../assets/app-logo.png";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <img src={appLogo} alt="App Logo" style={{ width: 120, marginBottom: 20 }} />
      <h1>Welcome to Stash or Trash???</h1>
      <p>
        Please <Link to="/login">Login</Link> or <Link to="/signup">Sign Up</Link> to continue.
      </p>
      <p style={{ color: "#aaa", fontSize: 14, marginTop: 40 }}>
        Powered by RooftopMash, React & Firebase.
      </p>
    </div>
  );
}
