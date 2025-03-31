import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "flowbite-react";
import "../styles/Navbar.css";
import { useAuth } from "../components/AuthContext"; 

const NavBar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth(); // ✅ Get auth state

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("ACCESS_TOKEN"); // ✅ Remove token
    setIsLoggedIn(false); // ✅ Update auth state
    navigate("/login"); // ✅ Redirect to login page
    setTimeout(() => window.location.reload(), 500); // ✅ Force refresh to clear reservations
  };
  
  return (
    <Navbar className="navbar" fluid>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">Artivista</Link>
        </div>

        {/* NAV LINKS */}
        <Navbar.Collapse>
          <ul className="navbar-links">
            <li>
              <Link to="/browse-museums">Browse Museums</Link>
            </li>
            <li>
              <Link to="/my-reservations">My Reservations</Link>
            </li>
            {isLoggedIn ? (
              <li>
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
             )} 
          </ul>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
};

export default NavBar;
