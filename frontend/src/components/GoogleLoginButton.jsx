import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode"; 
import api from "../api"; 



const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const { setIsLoggedIn, setToken } = useAuth();

    const handleSuccess = async (response) => {
        try {
          const res = await api.post("/api/auth/social/google/", {
            access_token: response.credential,
          });
      
          console.log("Login success:", res.data);
      
          // ✅ Add this part to update frontend state
          localStorage.setItem("ACCESS_TOKEN", res.data.access_token);
          localStorage.setItem("REFRESH_TOKEN", res.data.refresh_token);
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
