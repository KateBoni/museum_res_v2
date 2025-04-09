import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../components/AuthContext"; 
import "../styles/Reservations.css";

const Reservations = () => {
  const { isLoggedIn, token, user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [museums, setMuseums] = useState([]);

  const getMuseumName = (museumId) => {
    const museum = museums.find((m) => m.id === museumId);
    return museum ? museum.name : "Unknown Museum";
  };

  useEffect(() => {
    if (token) {
      fetchReservations(token); 
    }
  }, [token]);

  const fetchReservations = async (token) => {
    try {
      console.log("🔎 Fetching reservations with token:", token);
      const response = await api.get("api/reservations/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(response.data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMuseums();
  }, []);

  const fetchMuseums = async () => {
    try {
      const response = await api.get("api/museums/");
      setMuseums(response.data);
    } catch (error) {
      console.error("Error fetching museums:", error);
    }
  };

  return (
    <div className="container">
      <h2>My Reservations</h2>
      {loading ? (
        <p>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <ul className="reservation-list">
          {reservations.map((reservation) => (
            <li key={reservation.id} className={`reservation-item ${reservation.is_expired ? 'expired' : ''}`}>
              <strong>🏛️ {getMuseumName(reservation.museum)}</strong>
              <p>🎟️ Tickets: {reservation.num_tickets}</p>
              <p>📅 Return Date: {reservation.date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reservations;
