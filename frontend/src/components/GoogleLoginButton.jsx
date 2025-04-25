import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import api from "../api"; 



const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const { setIsLoggedIn, setToken } = useAuth(); // Ενημέρωση authentication

    const handleSuccess = async (response) => {
        try {
          const res = await api.post("/api/auth/social/google/", {
            access_token: response.credential,
          }); // Αποστολή token Google στο backend

          localStorage.setItem("ACCESS_TOKEN", res.data.access_token); // Αποθήκευση νέου access token
          localStorage.setItem("REFRESH_TOKEN", res.data.refresh_token); // Αποθήκευση νέου refresh token
          setToken(res.data.access_token);
          setIsLoggedIn(true);
      
          navigate("/");
      
        } catch (error) {
          console.error("Google login error:", error.response?.data || error.message);
        }
      };
      

    return (
        <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Google Login Failed")} />
    );
};

export default GoogleLoginButton;
