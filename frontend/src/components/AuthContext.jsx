import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";  

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("ACCESS_TOKEN")); // Κατάσταση σύνδεσης χρήστη
  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN")); 
  const [isAdmin, setIsAdmin] = useState(false);  // Έλεγχος αν ο χρήστης είναι admin

  
  useEffect(() => {  // Διαβάζει το token και αναγνωρίζει αν είναι admin
    const storedToken = localStorage.getItem("ACCESS_TOKEN");
    setIsLoggedIn(!!storedToken);
    setToken(storedToken);
  
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setIsAdmin(decoded?.is_staff || false); 
      } catch (err) {
        console.error("Error decoding token:", err);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [token]);
  

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, token, setToken, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
