import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google"; 
import { useAuth } from "../components/AuthContext";

function LogoutButton() {
    const navigate = useNavigate();
    const { setIsLoggedIn, setToken } = useAuth();

    const handleLogout = () => {
        // ✅ Step 1: Fully clear stored authentication data
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        sessionStorage.clear();

        // ✅ Step 2: Reset React state
        setIsLoggedIn(false);
        setToken(null);

        // ✅ Step 3: Ensure Google logout happens correctly
        googleLogout();

        // ✅ Step 4: Force a full reload to prevent old session data
        window.location.href = "/login"; 
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
}

export default LogoutButton;



