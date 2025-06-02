import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import appLogo from "../assets/app-logo.png";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "1rem", background: "#f5f5f5", display: "flex", justifyContent: "space-between" }}>
      <div>
        <img src={appLogo} alt="logo" style={{ height: 36, verticalAlign: "middle", marginRight: 12 }} />
        <Link to="/" style={{ fontWeight: "bold" }}>Stash or Trash</Link>
      </div>
      <div>
        {!user && (
          <>
            <Link to="/login" style={{ marginRight: 15 }}>Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
        {user && (
          <>
            <Link to="/brands" style={{ marginRight: 15 }}>Brands</Link>
            <Link to="/admin" style={{ marginRight: 15 }}>Admin</Link>
            <Link to="/profile" style={{ marginRight: 15 }}>Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
