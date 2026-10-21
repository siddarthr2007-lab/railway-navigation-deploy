import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    localStorage.getItem("isUserLoggedIn") === "true"
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "Passenger"
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setIsUserLoggedIn(localStorage.getItem("isUserLoggedIn") === "true");
      setUserName(localStorage.getItem("userName") || "Passenger");
    };

    window.addEventListener("userAuthChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("userAuthChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    window.location.href = "/";
  };

  const handleUserLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userAccessibility");
    localStorage.removeItem("userSavedStations");
    window.dispatchEvent(new Event("userAuthChange"));
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </span>
        <span className="brand-text">Navi<span className="brand-accent">Go</span></span>
      </Link>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        <Link to="/stations" className={location.pathname.startsWith("/stations") ? "active" : ""}>Stations</Link>

        {/* Passenger Auth Section */}
        {isUserLoggedIn ? (
          <div className="navbar-user-group">
            <Link
              to="/profile"
              className={`user-profile-badge ${location.pathname === "/profile" ? "active" : ""}`}
              title="View your Passenger Profile & Saved Stations"
            >
              <span className="user-avatar-mini">
                {userName.charAt(0).toUpperCase()}
              </span>
              <span className="user-name-display">{userName}</span>
            </Link>
            <button
              type="button"
              className="user-nav-logout-btn"
              onClick={handleUserLogout}
              title="Sign Out of Passenger Account"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className={`user-login-nav-btn ${location.pathname === "/login" ? "active" : ""}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Passenger Sign In</span>
          </Link>
        )}

        <span className="navbar-divider">|</span>

        {/* Admin Portal Section */}
        {isAdmin ? (
          <>
            <Link to="/admin/dashboard" className={location.pathname.startsWith("/admin/dashboard") ? "active admin-portal-link" : "admin-portal-link"}>
              Admin Portal
            </Link>
            <button className="link-button logout-btn" onClick={handleAdminLogout}>Admin Logout</button>
          </>
        ) : (
          <Link to="/admin/login" className="admin-link">Admin</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
