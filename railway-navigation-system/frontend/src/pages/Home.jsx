import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getStations } from "../services/stationService";

const REGIONS = [
  { id: "all", label: "🌟 All Tamil Nadu (26)" },
  { id: "chennai_north", label: "🏛️ Chennai & North", filterKey: "Chennai & Northern TN" },
  { id: "kongu_west", label: "🏭 Kongu & Western", filterKey: "Kongu & Western TN" },
  { id: "central_delta", label: "🌾 Cauvery Delta", filterKey: "Central & Cauvery Delta" },
  { id: "southern", label: "🛕 Southern TN", filterKey: "Southern TN" },
];

function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    getStations()
      .then((res) => setStations(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      // Region filter
      if (selectedRegion !== "all") {
        const rObj = REGIONS.find((r) => r.id === selectedRegion);
        if (rObj && s.region !== rObj.filterKey) return false;
      }

      // Search filter
      if (search.trim()) {
        const term = search.toLowerCase().trim();
        const matchesName = s.stationName.toLowerCase().includes(term);
        const matchesCode = s.stationCode.toLowerCase().includes(term);
        const matchesCity = s.city.toLowerCase().includes(term);
        const matchesRegion = (s.region || "").toLowerCase().includes(term);
        const matchesDiv = (s.division || "").toLowerCase().includes(term);
        return matchesName || matchesCode || matchesCity || matchesRegion || matchesDiv;
      }

      return true;
    });
  }, [stations, selectedRegion, search]);

  return (
    <div className="page home-page-clean">
      {/* Header Banner */}
      <section className="portal-header">
        <div className="portal-network-badge">
          🚆 Southern Railway · Tamil Nadu Network
        </div>
        <h1>NaviGo Station Navigation</h1>
        <p className="portal-subtitle">
          Real-time indoor facility navigation, multi-platform skywalk routes, and wheelchair-accessible paths across <strong>26 Major Railway Stations</strong> throughout Tamil Nadu.
        </p>

        {/* Quick Highlights Row */}
        <div className="portal-highlights-row">
          <div className="highlight-item">
            <span className="hl-number">26</span>
            <span className="hl-label">Major Stations</span>
          </div>
          <div className="highlight-item">
            <span className="hl-number">100%</span>
            <span className="hl-label">Indoor Routable</span>
          </div>
          <div className="highlight-item">
            <span className="hl-number">♿</span>
            <span className="hl-label">Barrier-Free Access</span>
          </div>
          <div className="highlight-item">
            <span className="hl-number">4</span>
            <span className="hl-label">SR Divisions</span>
          </div>
        </div>

        {/* Quick Station Search */}
        <div className="station-search-container">
          <input
            type="text"
            className="station-main-search"
            placeholder="Search railway station by name, code (e.g. MAS, MS, CBE, TPJ, MDU), city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
              aria-label="Clear Search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Home Quick Region Filter Pills */}
        <div className="home-region-pills">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`home-pill-btn ${selectedRegion === r.id ? "active" : ""}`}
              onClick={() => setSelectedRegion(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* Stations List */}
      <section className="portal-stations-section">
        <div className="portal-section-header">
          <div className="section-title-wrap">
            <h2>Select a Railway Station</h2>
            <span className="station-count-tag">
              {filteredStations.length} of {stations.length || 26} Stations Available
            </span>
          </div>
          <Link to="/stations" className="view-all-stations-link">
            View All Stations Directory →
          </Link>
        </div>

        {loading ? (
          <div className="portal-loading">Loading Tamil Nadu railway network...</div>
        ) : (
          <div className="portal-stations-grid">
            {filteredStations.map((station) => (
              <div key={station._id} className="station-tile">
                <div className="station-tile-header">
                  <div className="tile-code-group">
                    <span className="station-code-pill">{station.stationCode}</span>
                    {station.division && (
                      <span className="tile-div-tag">DIV: {station.division}</span>
                    )}
                  </div>
                  <span className="station-platforms-count">🚆 {station.totalPlatforms} Platforms</span>
                </div>

                <div className="tile-meta-row">
                  <span className="tile-region-tag">{station.region || "Tamil Nadu"}</span>
                  {station.category && (
                    <span className="tile-cat-tag">{station.category}</span>
                  )}
                </div>

                <h3 className="station-tile-name">{station.stationName}</h3>
                <p className="station-tile-city">📍 {station.city}, {station.state}</p>
                <p className="station-tile-desc">{station.description}</p>
                
                <div className="station-tile-actions">
                  <Link to={`/stations/${station._id}/navigate`} className="tile-btn-primary">
                    🧭 Plan Route
                  </Link>
                  <Link to={`/stations/${station._id}`} className="tile-btn-secondary">
                    🗺️ Station Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredStations.length === 0 && (
          <div className="empty-home-filter">
            <p>No stations found matching "<strong>{search}</strong>".</p>
            <button
              type="button"
              className="reset-search-btn"
              onClick={() => {
                setSearch("");
                setSelectedRegion("all");
              }}
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
