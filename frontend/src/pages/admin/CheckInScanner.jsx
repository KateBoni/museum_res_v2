import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrReader } from "react-qr-reader";
import "../../styles/admin/CheckInScanner.css";

const CheckInScanner = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [scanned, setScanned] = useState(false);

  const handleScan = (result) => {
    if (result?.text && !scanned) {
      setScanned(true); 
      const text = result.text.trim();
      const match = text.match(/RESERVATION:(\d+)/);
      const reservationId = match ? match[1] : null;

      if (reservationId) {
        navigate(`/admin/check-in/${reservationId}`);
      } else if (text.includes("/admin/check-in/")) {
        const id = text.split("/admin/check-in/")[1];
        navigate(`/admin/check-in/${id}`);
      } else {
        setError("Invalid QR format. Please try again.");
        setScanned(false);
      }
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Scan QR Code</h1>
      <p>Scan a visitor's QR code to check in their reservation.</p>

      <div className="scanner-box">
        <QrReader
          constraints={{ facingMode: "environment" }}
          onResult={handleScan}
          scanDelay={500}
          style={{ width: "100%" }}
        />
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CheckInScanner;
