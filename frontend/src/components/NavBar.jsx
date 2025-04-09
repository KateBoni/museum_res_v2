import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "flowbite-react";
import "../styles/Navbar.css";
import { useAuth } from "../components/AuthContext"; 

const NavBar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth(); 

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("ACCESS_TOKEN"); 
    setIsLoggedIn(false); 
    navigate("/login"); 
    setTimeout(() => window.location.reload(), 500); 
  };
  
  return (
    <Navbar className="navbar" fluid>
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">MyMuseum</Link>
        </div>

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
