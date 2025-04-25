import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../components/AuthContext";

const CheckInPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchReservation = async () => {
    try {
      const res = await api.get(`/api/reservations/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservation(res.data);
    } catch (err) {
      console.error("Failed to load reservation", err);
      setMessage("Failed to load reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    const confirmed = window.confirm("Are you sure you want to check in this reservation?");
    if (!confirmed) return;

    try {
      const res = await api.post(`/api/reservations/${id}/checkin/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || "Check-in successful!");
      fetchReservation(); 
    } catch (err) {
      console.error("Check-in failed", err);
      setMessage(err.response?.data?.message || "Check-in failed");
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  if (loading) return <div className="admin-container">Loading reservation...</div>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">Reservation Check-In</h1>

      {message && <p className="checkin-message">{message}</p>}

      {reservation ? (
        <div className="museum-card">
          <p><strong>User:</strong> {reservation.user_name}</p>
          <p><strong>Museum:</strong> {reservation.museum_name}</p>
          <p><strong>Date:</strong> {reservation.date}</p>
          <p><strong>Tickets:</strong> {reservation.num_tickets}</p>
          <p><strong>Checked In:</strong> {reservation.checked_in ? "✅" : "❌"}</p>
          {reservation.checked_in && (
            <p><strong>Check-In Time:</strong> {new Date(reservation.checkin_time).toLocaleString()}</p>
          )}

          {!reservation.checked_in && (
            <button onClick={handleCheckIn} className="save-button">✅ Check In</button>
          )}
        </div>
      ) : (
        <p>Reservation not found.</p>
      )}

      <button onClick={() => navigate("/admin/reservations")} className="cancel-button">← Back</button>
    </div>
  );
};

export default CheckInPage;
