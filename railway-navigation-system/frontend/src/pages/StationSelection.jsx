import { useEffect, useState, useMemo } from "react";
import StationCard from "../components/StationCard";
import { getStations } from "../services/stationService";

const REGIONS = [
  { id: "all", label: "🌟 All Tamil Nadu", countMatch: () => true },
  { id: "chennai_north", label: "🏛️ Chennai & Northern TN", filterKey: "Chennai & Northern TN" },
  { id: "kongu_west", label: "🏭 Kongu & Western TN", filterKey: "Kongu & Western TN" },
  { id: "central_delta", label: "🌾 Central & Cauvery Delta", filterKey: "Central & Cauvery Delta" },
  { id: "southern", label: "🛕 Southern TN", filterKey: "Southern TN" },
];

const DIVISIONS = ["ALL", "MAS", "SA", "TPJ", "MDU", "TVC", "SWR"];

function StationSelection() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRegion, setActiveRegion] = useState("all");
  const [activeDivision, setActiveDivision] = useState("ALL");

  useEffect(() => {
    getStations()
      .then((res) => setStations(res.data))
      .catch(() => setError("Could not load stations. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  // Filter stations based on Region, Division, and Search
  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      // 1. Region filter
      if (activeRegion !== "all") {
        const regionObj = REGIONS.find((r) => r.id === activeRegion);
        if (regionObj && s.region !== regionObj.filterKey) {
          return false;
        }
      }

      // 2. Division filter
      if (activeDivision !== "ALL") {
        if (s.division !== activeDivision) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = s.stationName.toLowerCase().includes(term);
        const matchesCode = s.stationCode.toLowerCase().includes(term);
        const matchesCity = s.city.toLowerCase().includes(term);
        const matchesRegion = (s.region || "").toLowerCase().includes(term);
        const matchesDiv = (s.division || "").toLowerCase().includes(term);
        const matchesCat = (s.category || "").toLowerCase().includes(term);

        if (!matchesName && !matchesCode && !matchesCity && !matchesRegion && !matchesDiv && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [stations, activeRegion, activeDivision, searchTerm]);

  // Compute counts per region
  const regionCounts = useMemo(() => {
    const counts = { all: stations.length };
    REGIONS.forEach((r) => {
      if (r.id !== "all") {
        counts[r.id] = stations.filter((s) => s.region === r.filterKey).length;
      }
    });
    return counts;
  }, [stations]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveRegion("all");
    setActiveDivision("ALL");
  };

  const hasActiveFilters = searchTerm !== "" || activeRegion !== "all" || activeDivision !== "ALL";

  return (
    <div className="page station-selection-page">
      {/* Directory Banner Header */}
      <div className="selection-header">
        <div className="header-badge">Southern Railway · Tamil Nadu Network</div>
        <h2>Tamil Nadu Railway Navigation Directory</h2>
        <p>
          Select from <strong>{stations.length || 26} Major Railway Stations & Junctions</strong> across Tamil Nadu for live indoor turn-by-turn navigation, platform skywalks, and wheelchair-accessible routes.
        </p>

        {/* Global Search Bar */}
        <div className="station-search-box-wrap">
          <input
            type="text"
            className="station-filter-input"
            placeholder="Search by station name, code (e.g. MAS, CBE, TPJ, MDU, SA), city, or division..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn-v2"
              onClick={() => setSearchTerm("")}
              aria-label="Clear Search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Region Filter Tabs */}
      <div className="regions-nav-tabs">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            className={`region-tab-btn ${activeRegion === region.id ? "active" : ""}`}
            onClick={() => setActiveRegion(region.id)}
          >
            <span>{region.label}</span>
            <span className="region-tab-badge">
              {regionCounts[region.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Division Quick Filter Bar */}
      <div className="division-filter-bar">
        <span className="division-filter-label">Filter by Division:</span>
        <div className="division-pills-list">
          {DIVISIONS.map((div) => (
            <button
              key={div}
              type="button"
              className={`div-filter-pill ${activeDivision === div ? "active" : ""}`}
              onClick={() => setActiveDivision(div)}
            >
              {div === "ALL" ? "All Divisions" : `DIV: ${div}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header Info */}
      <div className="filter-summary-row">
        <span className="filter-count-text">
          Showing <strong>{filteredStations.length}</strong> of <strong>{stations.length}</strong> railway stations
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleResetFilters}
          >
            Reset All Filters ✕
          </button>
        )}
      </div>

      {loading && (
        <div className="loading-spinner-box">
          <div className="pulse-loader"></div>
          <p>Loading Tamil Nadu Railway Network ({stations.length || "26"} Stations)...</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {/* Stations Grid */}
      {!loading && (
        <div className="station-grid-v2">
          {filteredStations.map((station) => (
            <StationCard key={station._id} station={station} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStations.length === 0 && (
        <div className="empty-stations-state">
          <div className="empty-icon">🔍</div>
          <h3>No railway stations match your search</h3>
          <p>Try searching for a different station name (e.g. "Chennai", "Coimbatore", "Trichy", "Madurai", "Salem"), station code, or clear the active filters.</p>
          <button type="button" className="btn-primary-reset" onClick={handleResetFilters}>
            Show All {stations.length} Tamil Nadu Stations
          </button>
        </div>
      )}
    </div>
  );
}

export default StationSelection;
