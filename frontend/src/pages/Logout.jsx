import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google"; 
import { useAuth } from "../components/AuthContext";

function LogoutButton() {
    const navigate = useNavigate();
    const { setIsLoggedIn, setToken } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        sessionStorage.clear();
        setIsLoggedIn(false);
        setToken(null);
        googleLogout();
        window.location.href = "/login"; 
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
}

export default LogoutButton;



