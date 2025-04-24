import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../components/AuthContext";
import "../../styles/admin/ManageUsers.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      await api.delete(`/api/users/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const toggleAdmin = async (user) => {
    const action = user.is_staff ? "revoke admin rights from" : "promote";
    const confirm = window.confirm(`Are you sure you want to ${action} ${user.username}?`);
    if (!confirm) return;

    try {
        await api.put(`/api/users/${user.id}/`, {
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_staff: !user.is_staff,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });          
      fetchUsers();
    } catch (err) {
        console.error("Failed to update user role:", err.response?.data || err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Users</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map((user) => (
          <div key={user.id} className="user-card">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Role:</strong> {user.is_staff ? "Admin" : "User"}</p>

            <button onClick={() => toggleAdmin(user)}>
              {user.is_staff ? "Downgrade to User" : "Promote to Admin"}
            </button>
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageUsers;
