import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useState } from "react";
import "../styles/Navbar.css";

const NavBar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    setIsLoggedIn(false);
    navigate("/login");
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">MyMuseum</Link>
        </div>
        <button
          className="hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        <ul className={`navbar-links ${isMobileMenuOpen ? "active" : ""}`}>
          {!isAdmin && (
            <li><Link to="/browse-museums">Browse Museums</Link></li>
          )}
          {isLoggedIn && !isAdmin && (
            <li><Link to="/my-reservations">My Reservations</Link></li>
          )}
          {isAdmin && (
            <li><Link to="/admin">Admin Panel</Link></li>
          )}
          {isLoggedIn ? (
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
