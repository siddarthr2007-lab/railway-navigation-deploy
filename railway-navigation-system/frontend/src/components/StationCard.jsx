import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toggleFavoriteStation } from "../services/userService";

function StationCard({ station }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const isLoggedIn = localStorage.getItem("isUserLoggedIn") === "true";

  const [isFavorited, setIsFavorited] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userSavedStations") || "[]");
      const hasFav = saved.some(
        (s) => (typeof s === "string" ? s : s?._id) === station._id
      );
      setIsFavorited(hasFav);
    } catch {
      setIsFavorited(false);
    }
  }, [station._id]);

  const handleToggleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !userId) {
      navigate("/login", { state: { from: `/stations` } });
      return;
    }

    setSavingFav(true);
    try {
      const res = await toggleFavoriteStation(userId, station._id);
      setIsFavorited(res.data.isFavorited);
      localStorage.setItem("userSavedStations", JSON.stringify(res.data.savedStations || []));
      window.dispatchEvent(new Event("userFavoritesChange"));
    } catch (err) {
      console.error("Error toggling favorite station", err);
    } finally {
      setSavingFav(false);
    }
  };

  // Region icon helper
  const getRegionIcon = (region) => {
    if (!region) return "📍";
    if (region.includes("Chennai") || region.includes("North")) return "🏛️";
    if (region.includes("Kongu") || region.includes("West")) return "🏭";
    if (region.includes("Delta") || region.includes("Central")) return "🌾";
    if (region.includes("South")) return "🛕";
    return "📍";
  };

  return (
    <div className="station-card-v2">
      <div className="card-header-bar">
        <div className="card-badges-left">
          <span className="station-code-badge">{station.stationCode}</span>
          {station.division && (
            <span className="division-badge">DIV: {station.division}</span>
          )}
        </div>
        <div className="card-header-right-actions">
          <span className="platform-tag">🚆 {station.totalPlatforms} Plat.</span>
          <button
            type="button"
            className={`station-favorite-btn ${isFavorited ? "favorited" : ""}`}
            onClick={handleToggleFav}
            disabled={savingFav}
            title={isFavorited ? "Saved in My Favorites" : "Add to My Favorites"}
            aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
          >
            {isFavorited ? "★" : "☆"}
          </button>
        </div>
      </div>

      <div className="card-region-row">
        <span className="region-pill-subtle">
          {getRegionIcon(station.region)} {station.region || "Tamil Nadu"}
        </span>
        {station.category && (
          <span className="category-pill-subtle">{station.category}</span>
        )}
      </div>

      <h3 className="station-title">{station.stationName}</h3>
      <p className="station-location">📍 {station.city}, {station.state}</p>
      <p className="station-desc">{station.description}</p>

      <div className="card-buttons-row">
        <Link to={`/stations/${station._id}/navigate`} className="nav-btn-primary">
          🧭 Navigate Inside
        </Link>
        <Link to={`/stations/${station._id}`} className="nav-btn-secondary">
          🗺️ Station Map
        </Link>
      </div>
    </div>
  );
}

export default StationCard;
