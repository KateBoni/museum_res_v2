import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Form.css";

function Register() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");  
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { username, email, password, first_name: firstName, last_name: lastName,}; // Δημιουργία payload
      await api.post("/api/user/register/", payload); // Αποστολή στοιχείων για εγγραφή
      navigate("/login");
    } catch (error) {
      alert("Registration failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Register</h1>

      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        className="form-input"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />

      <input
        className="form-input"
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />

      <input
        className="form-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <button className="form-button" type="submit">
        Register
      </button>
    </form>
  );
}

export default Register;
