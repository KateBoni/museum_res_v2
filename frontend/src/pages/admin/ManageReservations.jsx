import React, { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthContext"; 
import api from "../../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/admin/ManageReservations.css";

const ManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [selectedMuseum, setSelectedMuseum] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const { token } = useAuth();

  const fetchReservations = async (filters = {}, customToken = token) => {
    try {
      const params = new URLSearchParams();
      if (filters.museum) params.append("museum", filters.museum);
      if (filters.dateFrom) params.append("date_from", filters.dateFrom);
      if (filters.dateTo) params.append("date_to", filters.dateTo);

      params.append("admin", "true"); 
      const res = await api.get(`/api/reservations/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${customToken}` },
      });
      setReservations(res.data);
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    }
  };

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

  useEffect(() => {
    fetchMuseums();
    fetchReservations();
  }, []);

  const handleSearch = () => {
    const latestToken = localStorage.getItem("ACCESS_TOKEN");
    fetchReservations({
      museum: selectedMuseum,
      dateFrom: dateFrom ? dateFrom.toISOString().split("T")[0] : null,
      dateTo: dateTo ? dateTo.toISOString().split("T")[0] : null,
    }, latestToken);
    console.log("🔍 Filters applied:", {
      museum: selectedMuseum,
      dateFrom: dateFrom?.toISOString().split("T")[0],
      dateTo: dateTo?.toISOString().split("T")[0],
    });
  };

  const [editingReservationId, setEditingReservationId] = useState(null);
  const [editedReservation, setEditedReservation] = useState({});

  const startReservationEdit = (reservation) => {
    setEditingReservationId(reservation.id);
    setEditedReservation({ ...reservation });
  };

  const saveReservationEdit = async () => {
    const payload = {
      museum: editedReservation.museum,
      date: editedReservation.date,
      num_tickets: Number(editedReservation.num_tickets)
    };
  
  
    try {
      await api.put(`/api/reservations/${editingReservationId}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingReservationId(null);
      handleSearch();
    } catch (err) {
      console.error("Failed to update reservation:", err.response?.data || err);
    }
  };
  

  const deleteReservation = async (id) => {
    try {
      await api.delete(`/api/reservations/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleSearch();
    } catch (err) {
      console.error("Failed to delete reservation", err);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Manage Reservations</h1>

      <div className="filter-panel">
        <label>Museum:</label>
        <select value={selectedMuseum} onChange={(e) => setSelectedMuseum(e.target.value)}>
          <option value="">All Museums</option>
          {museums.map((museum) => (
            <option key={museum.id} value={museum.id}>{museum.name}</option>
          ))}
        </select>

        <label>Date From:</label>
        <DatePicker
          selected={dateFrom}
          onChange={(date) => setDateFrom(date)}
          placeholderText="Select start date"
        />

        <label>Date To:</label>
        <DatePicker
          selected={dateTo}
          onChange={(date) => setDateTo(date)}
          placeholderText="Select end date"
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      {reservations.length === 0 ? (
        <p style={{ color: "gray" }}>No reservations match your search criteria.</p>
      ) : (
        reservations.map((res) => (
          <div key={`${res.id}-${res.date}`} className="museum-card">
            <p><strong>Reservation ID:</strong> {res.id}</p>
            <p><strong>User ID:</strong> {res.user}</p>
            <p><strong>Username:</strong> {res.user_name}</p>
            <p><strong>Date:</strong> {res.date}</p>

            {editingReservationId === res.id ? (
              <>
                <label>Date:</label>
                <DatePicker
                  selected={new Date(editedReservation.date)}
                  onChange={(date) =>
                    setEditedReservation({
                      ...editedReservation,
                      date: date.toISOString().split("T")[0],
                    })
                  }
                />
                <label>Tickets:</label>
                <input
                  type="number"
                  value={editedReservation.num_tickets}
                  onChange={(e) =>
                    setEditedReservation({ ...editedReservation, num_tickets: e.target.value })
                  }
                />
                
                <button onClick={saveReservationEdit}>Save</button>
                <button onClick={() => setEditingReservationId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p><strong>Tickets:</strong> {res.num_tickets}</p>
                <button onClick={() => startReservationEdit(res)}>Edit</button>
                <button onClick={() => deleteReservation(res.id)}>Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ManageReservations;
