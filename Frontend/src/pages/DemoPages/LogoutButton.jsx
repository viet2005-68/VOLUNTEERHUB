import React from "react";
import { useAuth } from "../../hook/useAuth";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    // Force reload to clear all state
    window.location.href = "/";
  };
  return (
    <button onClick={handleLogout} style={{ marginTop: 20 }}>
      🚪 Logout
    </button>
  );
}

export default LogoutButton;
