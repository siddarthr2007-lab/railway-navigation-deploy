import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, toggleFavoriteStation } from "../services/userService";

function UserProfile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const isLoggedIn = localStorage.getItem("isUserLoggedIn") === "true";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPref, setSavingPref] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !userId) {
      // Auto-load demo user profile for demonstration
      import("../services/userService").then(({ loginUser }) => {
        loginUser({ email: "passenger@navigo.com", password: "user123" })
          .then((res) => {
            setUser(res.data.user);
            localStorage.setItem("isUserLoggedIn", "true");
            localStorage.setItem("userId", res.data.user.id);
            localStorage.setItem("userName", res.data.user.name);
            localStorage.setItem("userAccessibility", res.data.user.preferredAccessibility ? "true" : "false");
          })
          .catch(() => navigate("/login"))
          .finally(() => setLoading(false));
      });
      return;
    }

    getUserProfile(userId)
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("userAccessibility", res.data.preferredAccessibility ? "true" : "false");
        localStorage.setItem("userName", res.data.name);
      })
      .catch((err) => {
        console.error("Failed to fetch user profile", err);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, userId, navigate]);

  const handleToggleAccessibility = async () => {
    if (!user) return;
    const newPref = !user.preferredAccessibility;
    setSavingPref(true);
    setMessage("");

    try {
      const res = await updateUserProfile(userId, { preferredAccessibility: newPref });
      setUser(res.data.user);
      localStorage.setItem("userAccessibility", newPref ? "true" : "false");
      setMessage(newPref ? "Wheelchair & Step-Free preference enabled!" : "Standard routing preference enabled!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update preference");
    } finally {
      setSavingPref(false);
    }
  };

  const handleRemoveFavorite = async (stationId) => {
    try {
      const res = await toggleFavoriteStation(userId, stationId);
      setUser((prev) => ({
        ...prev,
        savedStations: res.data.savedStations || prev.savedStations.filter((s) => s._id !== stationId),
      }));
      localStorage.setItem("userSavedStations", JSON.stringify(res.data.savedStations || []));
      window.dispatchEvent(new Event("userFavoritesChange"));
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isUserLoggedIn");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userAccessibility");
    localStorage.removeItem("userSavedStations");
    window.dispatchEvent(new Event("userAuthChange"));
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  return (
    <div className="page user-profile-page">
      {/* Top Banner */}
      <div className="profile-banner-card">
        <div className="profile-header-main">
          <div className="profile-avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="profile-titles">
            <div className="profile-role-badge">🚆 NaviGo Passenger Account</div>
            <h2>{user?.name || localStorage.getItem("userName") || "Passenger"}</h2>
            <div className="profile-meta-row">
              <span className="profile-meta-pill">✉️ {user?.email || localStorage.getItem("userEmail")}</span>
              {user?.phone && <span className="profile-meta-pill">📱 {user.phone}</span>}
              <span className="profile-meta-pill status-active">● Active Passenger</span>
            </div>
          </div>
        </div>

        <div className="profile-top-actions">
          <Link to="/stations" className="explore-stations-btn">
            🔍 Browse Stations
          </Link>
          <button type="button" className="profile-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      {message && (
        <div className="auth-alert success-alert profile-alert">
          <span>{message}</span>
        </div>
      )}

      {/* Grid: Preferences & Saved Stations */}
      <div className="profile-content-grid">
        {/* Left Column: Preferences */}
        <div className="profile-card preference-card">
          <div className="profile-card-header">
            <h3>🧭 Navigation & Accessibility Preferences</h3>
            <p>Customize your default route calculations across all 26 Tamil Nadu railway stations.</p>
          </div>

          <div className="preference-toggle-box">
            <div className="pref-info-left">
              <div className="pref-title-with-icon">
                <span className="pref-icon">♿</span>
                <strong>Wheelchair & Step-Free Route Priority</strong>
              </div>
              <p className="pref-explanation">
                When enabled, the navigation engine prioritizes elevators, ramps, wide corridor nodes, and avoids stairs.
              </p>
            </div>
            <button
              type="button"
              className={`pref-toggle-switch ${user?.preferredAccessibility ? "active" : ""}`}
              onClick={handleToggleAccessibility}
              disabled={savingPref}
            >
              <span className="switch-knob"></span>
              <span className="switch-label">
                {user?.preferredAccessibility ? "ENABLED" : "DISABLED"}
              </span>
            </button>
          </div>

          <div className="travel-tips-card">
            <h4>💡 Quick Accessibility Tips:</h4>
            <ul>
              <li>All 26 major stations include dedicated step-free elevator and ramp links.</li>
              <li>You can also toggle the wheelchair filter anytime on the live navigation map.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Saved Stations */}
        <div className="profile-card favorites-card">
          <div className="profile-card-header favorites-header-flex">
            <div>
              <h3>⭐ My Bookmarked Stations</h3>
              <p>Quick access to your frequently visited railway hubs.</p>
            </div>
            <span className="fav-count-pill">
              {user?.savedStations?.length || 0} Saved
            </span>
          </div>

          {loading ? (
            <p className="loading-state-text">Loading saved stations...</p>
          ) : user?.savedStations && user.savedStations.length > 0 ? (
            <div className="saved-stations-list">
              {user.savedStations.map((station) => (
                <div key={station._id} className="saved-station-item">
                  <div className="saved-station-left">
                    <span className="saved-code-pill">{station.stationCode}</span>
                    <div className="saved-station-info">
                      <strong>{station.stationName}</strong>
                      <span className="saved-sub-text">
                        📍 {station.city} · {station.totalPlatforms} Platforms {station.division ? `· Div: ${station.division}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="saved-station-actions">
                    <Link
                      to={`/stations/${station._id}/navigate`}
                      className="saved-nav-link"
                      title="Navigate Inside"
                    >
                      🧭 Navigate
                    </Link>
                    <Link
                      to={`/stations/${station._id}`}
                      className="saved-view-link"
                      title="View Map"
                    >
                      🗺️ Map
                    </Link>
                    <button
                      type="button"
                      className="saved-remove-btn"
                      onClick={() => handleRemoveFavorite(station._id)}
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-saved-stations">
              <span className="empty-icon">🚆</span>
              <h4>No Saved Stations Yet</h4>
              <p>
                Bookmark your frequent stations (like Chennai Central, Coimbatore, Madurai, or Trichy) to quickly navigate them anytime!
              </p>
              <Link to="/stations" className="browse-stations-cta">
                Explore All 26 Stations →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
