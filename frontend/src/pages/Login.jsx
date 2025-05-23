import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";  
import api from "../api";
import GoogleLoginButton from "../components/GoogleLoginButton"; 

const Login = () => {
  const navigate = useNavigate(); 
  const { setIsLoggedIn, setToken } = useAuth();  // Ενημέρωση της κατάστασης authentication
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        localStorage.clear(); // Καθαρίζουμε προηγούμενα tokens

        const response = await api.post("/api/token/", credentials); // Αποστολή username/password και λήψη νέων tokens
        localStorage.setItem("ACCESS_TOKEN", response.data.access); 
        localStorage.setItem("REFRESH_TOKEN", response.data.refresh);

        setToken(response.data.access); // Ενημέρωση token στο context
        setIsLoggedIn(true); // Ο χρήστης έχει συνδεθεί

        navigate("/");
    } catch (error) {
        console.error("Login failed:", error);
        alert("Invalid username or password.");
    }
};


  return (
    <form onSubmit={handleLogin} className="form-container">
      <h1>Login</h1>
      <input
        className="form-input"
        type="text"
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        placeholder="Username"
        required
      />
      <input
        className="form-input"
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button className="form-button" type="submit">Login</button>
      <div>
        <GoogleLoginButton />
      </div>
    </form>
  );
};

export default Login;
