import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const logout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </span>
        <span className="brand-text">Navi<span className="brand-accent">Go</span></span>
      </Link>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
        <Link to="/stations" className={location.pathname.startsWith("/stations") ? "active" : ""}>Stations</Link>
        {isAdmin ? (
          <>
            <Link to="/admin/dashboard" className={location.pathname.startsWith("/admin/dashboard") ? "active" : ""}>
              Admin Portal
            </Link>
            <button className="link-button logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/admin/login" className="admin-link">Admin</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
