import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div>Loading...</div>;

  console.log("🔒 AdminRoute Final Check →", { isLoggedIn, isAdmin });

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
