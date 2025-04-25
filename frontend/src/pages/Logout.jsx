import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google"; 
import { useAuth } from "../components/AuthContext";

function LogoutButton() {
    const navigate = useNavigate();
    const { setIsLoggedIn, setToken } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN"); // Διαγραφή access token
        localStorage.removeItem("REFRESH_TOKEN"); // Διαγραφή refresh token
        sessionStorage.clear(); // Καθαρισμός session storage
        setIsLoggedIn(false); // Ο χρήστης έχει αποσυνδεθεί
        setToken(null); // Καθαρισμός token
        googleLogout(); // Αποσύνδεση Google
        navigate("/login"); 
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
}

export default LogoutButton;



