import React, { useState , useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext"; 
import "../styles/ReservationForm.css";
import api from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/react-datepicker-overrides.css";

const ReservationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { museumId, museumName, museumPhoto, museumDescription, museumLocation, museumOpeningHours } = location.state || {};
    const [date, setDate] = useState("");
    const [numTickets, setNumTickets] = useState(1); 
    const [availableSpots, setAvailableSpots] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [qrImage, setQrImage] = useState(null);


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
            setIsSubmitting(false);
            return;
        }
    
        if (numTickets > availableSpots) {
            setError("Not enough available spots.");
            setIsSubmitting(false);
            return;
        }
    
        const reservationData = {
            museum: museumId,
            date: date,
            num_tickets: numTickets,
        };
    
        try {
            const response = await api.post("/api/reservations/", reservationData, {
                headers: {
                    Authorization: `Bearer ${latestToken}`,
                    "Content-Type": "application/json",
                },
            });
    
            console.log("Reservation created:", response.data);
    
            // 🔥 Send QR Code Email
            const qrResponse = await api.get("/send-qr-email/", {
                headers: {
                    Authorization: `Bearer ${latestToken}`,
                },
            });

            // Save the QR code to state for display
            if (qrResponse.data.qr_base64) {
                setQrImage(`data:image/png;base64,${qrResponse.data.qr_base64}`);
            }

    
            alert("Reservation successful! A QR code has been sent to your email.");
            // navigate("/");
        } catch (error) {
            console.error("Error creating reservation:", error);
            setError(error.response?.data?.message || "Failed to create reservation.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    

    return (
        <div className="reservation-page">
            <div className="museum-details">
                <img src={museumPhoto || "https://via.placeholder.com/500x300"} alt={museumName} className="museum-photo" />
                <h2>{museumName}</h2>
                <p>{museumDescription}</p>
                <p><strong>Location:</strong> {museumLocation}</p>
                <p><strong>Opening Hours:</strong> {museumOpeningHours}</p>
                
            </div>
            <div className="reservation-form-section">
                <h2>Make a Reservation</h2>
                <form className="reservation-form" onSubmit={handleSubmit}>
                    <label>Reservation Date:</label>
                    <DatePicker
                        selected={date ? new Date(date) : null} 
                        onChange={(dateObj) => {
                            const formatted = dateObj.toISOString().split("T")[0];
                            setDate(formatted);
                        }}
                        inline
                    />




                    <label>Number of Tickets:</label>
                    <input
                        type="number"
                        min="1"
                        value={numTickets}
                        onChange={(e) => setNumTickets(e.target.value)}
                        required
                    />
                    {availableSpots !== null && <p><strong>Available Spots:</strong> {availableSpots}</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button className="reservation-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Reserving..." : "Reserve"}
                    </button>
                    {qrImage && (
                        <div className="qr-code-section">
                            <h3>Your Reservation QR Code:</h3>
                            <img src={qrImage} alt="QR Code" className="qr-image" />
                            <p>You will also receive this QR code by email.</p>
                            <p>Please show it at the entrance upon arrival. We look forward to seeing you!</p>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default ReservationForm;
