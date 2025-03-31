import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("ACCESS_TOKEN"));
  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));

  useEffect(() => {
    const checkAuth = () => {
        const storedToken = localStorage.getItem("ACCESS_TOKEN");
        setIsLoggedIn(!!storedToken);
        setToken(storedToken);  
    };

    window.addEventListener("storage", checkAuth);
    checkAuth(); 

    return () => {
        window.removeEventListener("storage", checkAuth);
    };
  }, []);


  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



