import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/AdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <h1>Welcome to the Admin Panel</h1>
      <div className="admin-buttons">
        <button onClick={() => navigate("/admin/museums")}>Manage Museums</button>
        <button onClick={() => navigate("/admin/reservations")}>Manage Reservations</button>
        <button onClick={() => navigate("/admin/users")}>Manage Users</button>
        <button onClick={() => navigate("/admin/check-in")}>Check-in Users</button>
      </div>
    </div>
  );
};

export default AdminPage;
