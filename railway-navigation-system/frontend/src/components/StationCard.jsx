import { Link } from "react-router-dom";

function StationCard({ station }) {
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
        <span className="platform-tag">🚆 {station.totalPlatforms} Platforms</span>
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
