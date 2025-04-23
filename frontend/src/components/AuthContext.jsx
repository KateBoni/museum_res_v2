import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";  // Make sure this is installed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("ACCESS_TOKEN"));
  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = localStorage.getItem("ACCESS_TOKEN");
      setIsLoggedIn(!!storedToken);
      setToken(storedToken);

      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          console.log("🔍 Decoded Token:", decoded);
          setIsAdmin(decoded?.is_staff || false); 
        } catch (err) {
          console.error("Error decoding token:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    window.addEventListener("storage", checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, token, setToken, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
