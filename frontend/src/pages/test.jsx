import React, { useState , useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext"; // Ensure this is correctly imported
import "../styles/ReservationForm.css";
import api from "../api";

const ReservationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // ✅ Get museum ID and name from navigation state
    const { museumId, museumName } = location.state || {};
    const [date, setDate] = useState("");
    const [numTickets, setNumTickets] = useState(1); 
    const [availableSpots, setAvailableSpots] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { token } = useAuth(); 

    useEffect(() => {
        if (date) {
            fetchAvailableSpots();
        }
    }, [date]);


    const fetchAvailableSpots = async () => {
        try {
            const response = await api.get(`/api/museums/${museumId}/`, {
                params: { date },
            });
            console.log("Available spots:", response.data.available_spots);
            setAvailableSpots(response.data.available_spots);
        } catch (error) {
            console.error("Error fetching available spots:", error);
            setAvailableSpots(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
    
    
        const latestToken = localStorage.getItem("ACCESS_TOKEN");
    
        if (!latestToken) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
            return;
        }

        if (!date) {
            setError("Please select a date.");
            return;
        }

        if (numTickets > availableSpots) {
            setError("Not enough available spots.");
            return;
        }
    
        const reservationData = {
            museum: museumId,  
            date: date,
            num_tickets: numTickets,
        };
    
        try {
            const response = await api.post(
                "/api/reservations/",
                reservationData,
                {
                    headers: {
                        Authorization: `Bearer ${latestToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
    
            console.log("Reservation created:", response.data);
            alert("Reservation successful!");
            navigate("/");
    
        } catch (error) {
            console.error("Error creating reservation:", error);
            setMessage(error.response?.data?.message || "Failed to create reservation.");
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <div className="reservation-container">
            <h2>Make Your Reservation</h2>

            <form className="reservation-form" onSubmit={handleSubmit}>
                <p><strong>{museumName}</strong></p>

                <label>Reservation Date:</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />

                <label>Number of Tickets:</label>
                <input
                    type="number"
                    min="1"
                    value={numTickets}
                    onChange={(e) => setNumTickets(e.target.value)}
                    required
                />
                {availableSpots !== null && <p>Available Spots: {availableSpots}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                <button className="reservation-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Reserving..." : "Reserve"}
                </button>
            </form>
        </div>
    );
};

export default ReservationForm;
