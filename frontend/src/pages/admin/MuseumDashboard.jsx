import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import api from "../../api";
import "../../styles/admin/ManageMuseums.css";

const MuseumDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [museum, setMuseum] = useState(null);
  const [editedMuseum, setEditedMuseum] = useState({});
  const [photoFile, setPhotoFile] = useState(null);

  const [closedDates, setClosedDates] = useState([]);
  const [newClosedDate, setNewClosedDate] = useState({
    dateFrom: "",
    dateTo: "",
    reason: ""
  });
  
  useEffect(() => {
    fetchMuseum();
    fetchClosedDates();
  }, [id]);

  const fetchMuseum = async () => {
    try {
      const res = await api.get(`/api/museums/${id}/`);
      setMuseum(res.data);
      setEditedMuseum(res.data);
    } catch (err) {
      console.error("Failed to load museum", err);
    }
  };

  const fetchClosedDates = async () => {
    try {
      const res = await api.get(`/api/closed-dates/?museum=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClosedDates(res.data);
    } catch (err) {
      console.error("Failed to load closed dates", err);
    }
  };

  const handleSave = async () => {
    const confirmed = window.confirm("Save changes to this museum?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("name", editedMuseum.name);
    formData.append("description", editedMuseum.description);
    formData.append("location", editedMuseum.location);
    formData.append("type", editedMuseum.type);
    formData.append("opening_hours", editedMuseum.opening_hours);
    formData.append("capacity", Number(editedMuseum.capacity) || 0);
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      await api.put(`/api/museums/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Museum updated successfully");
      fetchMuseum(); 
    } catch (err) {
      console.error("Failed to update museum", err.response?.data || err);
    }
  };

  const addClosedDate = async () => {
    try {
      await api.post("/api/closed-dates/", {
          museum: id,
          date_from: newClosedDate.dateFrom,
          date_to: newClosedDate.dateTo,
          reason: newClosedDate.reason,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
      setNewClosedDate({ date: "", reason: "" });
      fetchClosedDates();
    } catch (err) {
      console.error("Failed to add closed date", err.response?.data || err);
    }
  };

  const deleteClosedDate = async (id) => {
    const confirmed = window.confirm("Delete this closed date?");
    if (!confirmed) return;
  
    console.log("🗑️ Deleting closed date:", id); 
  
    try {
      await api.delete(`/api/closed-dates/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClosedDates();
    } catch (err) {
      console.error("Failed to delete closed date", err);
    }
  };
  

  if (!museum) return <div>Loading museum...</div>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">{museum.name} – Admin Dashboard</h1>
      <button onClick={() => navigate("/admin/museums")} style={{ marginBottom: "1rem" }}>
        ← Back to Museum List
      </button>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="museum-card">
        <label>Name:</label>
        <input
          type="text"
          value={editedMuseum.name}
          onChange={(e) => setEditedMuseum({ ...editedMuseum, name: e.target.value })}
        />

        <label>Description:</label>
        <textarea
          value={editedMuseum.description}
          onChange={(e) => setEditedMuseum({ ...editedMuseum, description: e.target.value })}
        />

        <label>Location:</label>
        <input
          type="text"
          value={editedMuseum.location}
          onChange={(e) => setEditedMuseum({ ...editedMuseum, location: e.target.value })}
        />

        <label>Type:</label>
        <select
          value={editedMuseum.type}
          onChange={(e) => setEditedMuseum({ ...editedMuseum, type: e.target.value })}
        >
          <option value="history">History</option>
          <option value="art">Art</option>
          <option value="science">Science</option>
          <option value="ancient">Archaeological Site</option>
          <option value="other">Other</option>
        </select>

        <label>Opening Hours:</label>
        <input
          type="text"
          value={editedMuseum.opening_hours}
          onChange={(e) => setEditedMuseum({ ...editedMuseum, opening_hours: e.target.value })}
        />

        <label>Capacity:</label>
        <input
          type="number"
          value={editedMuseum.capacity}
          onChange={(e) => setEditedMuseum({ ...editedMuseum, capacity: e.target.value })}
        />

        <label>Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />

        <button type="submit" className="save-button">Save Changes</button>
      </form>

      <h2 className="section-title">Closed Dates</h2>
      <div className="museum-card">
      <ul>
        {closedDates.map((cd) => (
          <li key={cd.id}>
            {cd.date_from} → {cd.date_to} {cd.reason && `– ${cd.reason}`}
            <button className="delete-button" onClick={() => deleteClosedDate(cd.id)}>Delete</button>
          </li>
        ))}
      </ul>


        <label>From:</label>
          <input
            type="date"
            value={newClosedDate.dateFrom || ""}
            onChange={(e) => setNewClosedDate({ ...newClosedDate, dateFrom: e.target.value })}
          />

          <label>To:</label>
          <input
            type="date"
            value={newClosedDate.dateTo || ""}
            onChange={(e) => setNewClosedDate({ ...newClosedDate, dateTo: e.target.value })}
          />

        <input
          type="text"
          placeholder="Reason (optional)"
          value={newClosedDate.reason || ""}
          onChange={(e) => setNewClosedDate({ ...newClosedDate, reason: e.target.value })}
        />
        <button onClick={addClosedDate}>Add Closed Date</button>
      </div>
    </div>
  );
};

export default MuseumDashboard;
