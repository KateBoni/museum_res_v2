import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/AuthContext";
import api from "../../api";
import "../../styles/admin/ManageMuseums.css";

const ManageMuseums = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [museums, setMuseums] = useState([]);
  const [newMuseum, setNewMuseum] = useState({
    name: "",
    description: "",
    location: "",
    type: "other",
    opening_hours: "",
    capacity: 200,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const res = await api.get("/api/museums/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMuseums(res.data);
      } catch (err) {
        console.error("Failed to fetch museums", err);
      }
    };

    fetchMuseums();
  }, [token]);

  const handleCreateMuseum = async (e) => {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to add this museum?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("name", newMuseum.name);
    formData.append("description", newMuseum.description);
    formData.append("location", newMuseum.location);
    formData.append("type", newMuseum.type);
    formData.append("opening_hours", newMuseum.opening_hours);
    formData.append("capacity", newMuseum.capacity);
    if (selectedImage) {
      formData.append("photo", selectedImage);
    }

    try {
      await api.post("/api/museums/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setNewMuseum({
        name: "",
        description: "",
        location: "",
        type: "other",
        opening_hours: "",
        capacity: 200,
      });
      setSelectedImage(null);
      const res = await api.get("/api/museums/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMuseums(res.data);
    } catch (err) {
      console.error("Failed to create museum", err.response?.data || err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Museums</h1>
      <p>Select a museum to view or edit its details:</p>

      <div className="manage-museum-list">
        {museums.map((museum) => (
          <button
            key={museum.id}
            className="manage-museum-list-item"
            onClick={() => navigate(`/admin/museums/${museum.id}`)}
          >
            {museum.name}
          </button>
        ))}
      </div>

      <h2 className="section-title">Add New Museum</h2>
      <form className="museum-card" onSubmit={handleCreateMuseum}>
        <label>Name:</label>
        <input
          type="text"
          value={newMuseum.name}
          onChange={(e) => setNewMuseum({ ...newMuseum, name: e.target.value })}
          required
        />

        <label>Description:</label>
        <textarea
          value={newMuseum.description}
          onChange={(e) => setNewMuseum({ ...newMuseum, description: e.target.value })}
          rows={2}
        />

        <label>Location:</label>
        <input
          type="text"
          value={newMuseum.location}
          onChange={(e) => setNewMuseum({ ...newMuseum, location: e.target.value })}
        />

        <label>Type:</label>
        <select
          value={newMuseum.type}
          onChange={(e) => setNewMuseum({ ...newMuseum, type: e.target.value })}
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
          value={newMuseum.opening_hours}
          onChange={(e) => setNewMuseum({ ...newMuseum, opening_hours: e.target.value })}
        />

        <label>Capacity:</label>
        <input
          type="number"
          value={newMuseum.capacity}
          onChange={(e) => setNewMuseum({ ...newMuseum, capacity: e.target.value })}
          min={1}
        />

        <label>Photo:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files[0])}
        />
        {selectedImage && (
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Preview"
            style={{ width: "100px", marginTop: "0.5rem", borderRadius: "8px" }}
          />
        )}

        <div>
          <button type="submit" className="save-button">Add Museum</button>
        </div>
      </form>
    </div>
  );
};

export default ManageMuseums;
