import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MapView from "../components/MapView";
import FacilityCard from "../components/FacilityCard";
import { getStation } from "../services/stationService";
import { getFacilitiesByStation } from "../services/facilityService";
import { toggleFavoriteStation } from "../services/userService";

function StationDetail() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [savingFav, setSavingFav] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userSavedStations") || "[]");
      const hasFav = saved.some((s) => (typeof s === "string" ? s : s?._id) === id);
      setIsFavorited(hasFav);
    } catch {
      setIsFavorited(false);
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    const userId = localStorage.getItem("userId");
    const isLoggedIn = localStorage.getItem("isUserLoggedIn") === "true";
    if (!isLoggedIn || !userId) {
      window.location.href = `/login?redirect=/stations/${id}`;
      return;
    }

    setSavingFav(true);
    try {
      const res = await toggleFavoriteStation(userId, id);
      setIsFavorited(res.data.isFavorited);
      localStorage.setItem("userSavedStations", JSON.stringify(res.data.savedStations || []));
      window.dispatchEvent(new Event("userFavoritesChange"));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingFav(false);
    }
  };

  useEffect(() => {
    getStation(id).then((res) => setStation(res.data)).catch(() => setError("Station not found"));
    getFacilitiesByStation(id).then((res) => setFacilities(res.data)).catch(() => setError("Could not load facilities"));
  }, [id]);

  const filtered = facilities.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.type.toLowerCase().includes(search.toLowerCase())
  );

  if (error) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!station) return <div className="page"><p>Loading station details...</p></div>;

  return (
    <div className="page station-detail-page">
      <div className="station-detail-banner">
        <div className="station-title-group">
          <Link to="/stations" className="back-to-stations-crumb">
            ← Back to Tamil Nadu Stations
          </Link>
          <div className="station-badge-row">
            <span className="code-pill">{station.stationCode}</span>
            {station.division && <span className="division-pill">DIV: {station.division}</span>}
            <span className="platforms-pill">🚆 {station.totalPlatforms} Platforms</span>
            <span className="city-pill">📍 {station.city}, {station.region || station.state}</span>
            {station.category && <span className="category-pill">{station.category}</span>}
          </div>
          <h2>{station.stationName}</h2>
          <p className="station-description">{station.description}</p>
        </div>

        <div className="station-banner-actions">
          <button
            type="button"
            className={`station-banner-fav-btn ${isFavorited ? "favorited" : ""}`}
            onClick={handleToggleFavorite}
            disabled={savingFav}
            title={isFavorited ? "Remove from bookmarked stations" : "Bookmark this station"}
          >
            {isFavorited ? "★ Bookmarked" : "☆ Bookmark Station"}
          </button>
          <Link to={`/stations/${id}/navigate`} className="launch-nav-btn">
            🚀 Open Live NaviGo Navigation →
          </Link>
        </div>
      </div>

      <div className="station-body">
        {/* Left: Searchable Amenities Panel */}
        <div className="facility-list-panel">
          <div className="facility-search-header">
            <h3>Station Facilities ({facilities.length})</h3>
            <p>Select any facility to locate it on the Google Maps floorplan</p>
            <input
              className="search-bar"
              type="text"
              placeholder="Search platforms, restrooms, food, lifts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="facility-list">
            {filtered.map((f) => (
              <FacilityCard key={f._id} facility={f} onClick={setSelected} />
            ))}
            {filtered.length === 0 && <p className="no-fac-found">No facilities match your search.</p>}
          </div>

          {selected && (
            <div className="facility-details-box">
              <h4>{selected.name}</h4>
              <p><strong>Category:</strong> {selected.type.replace(/_/g, " ")}</p>
              <p><strong>Floor Level:</strong> {selected.floor === 0 ? "Ground Floor" : `Floor ${selected.floor}`}</p>
              <p><strong>Operating Hours:</strong> {selected.operatingHours || "24 Hours"}</p>
              {selected.description && <p className="desc-text">{selected.description}</p>}
              <div className="amenity-badges-row">
                <span className={`pill ${selected.wheelchairAccessible ? "green" : "gray"}`}>
                  {selected.wheelchairAccessible ? "♿ Wheelchair Accessible" : "Standard Access"}
                </span>
                {selected.liftAvailable && <span className="pill blue">🛗 Lift Nearby</span>}
                {selected.rampAvailable && <span className="pill teal">♿ Ramp Available</span>}
              </div>

              <Link
                to={`/stations/${id}/navigate`}
                className="cta-button"
                style={{ display: "inline-block", marginTop: "12px", padding: "10px 16px", fontSize: "13px", fontWeight: "700" }}
              >
                🧭 Navigate Here in Live Mode →
              </Link>
            </div>
          )}
        </div>

        {/* Right: Google Maps Floorplan */}
        <div className="map-panel">
          <MapView
            facilities={facilities}
            station={station}
            onFacilityClick={setSelected}
            selectedFacilityId={selected?._id}
          />
        </div>
      </div>
    </div>
  );
}

export default StationDetail;
