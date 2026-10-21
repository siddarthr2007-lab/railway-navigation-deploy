import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import DirectionIcon from "../components/DirectionIcon";
import { getStation, getStations } from "../services/stationService";
import { getFacilitiesByStation } from "../services/facilityService";
import { calculateRoute } from "../services/navigationService";
import { ICONS } from "../components/FacilityCard";

function Navigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [allStations, setAllStations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [wheelchair, setWheelchair] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  useEffect(() => {
    getStation(id).then((res) => setStation(res.data)).catch(() => {});
    getStations().then((res) => setAllStations(res.data)).catch(() => {});
    getFacilitiesByStation(id).then((res) => {
      setFacilities(res.data);
      // Default to first entrance if available
      const entrance = res.data.find((f) => f.type.includes("entrance"));
      if (entrance) setFromId(entrance._id);
      // Default to platform 1 or platform 2
      const dest = res.data.find((f) => f.name.includes("Platform 1") || f.type === "platform");
      if (dest) setToId(dest._id);

      if (entrance?.navigationNodeId && dest?.navigationNodeId) {
        calculateRoute({
          stationId: id,
          fromNodeId: entrance.navigationNodeId,
          toNodeId: dest.navigationNodeId,
          wheelchair: false,
        }).then((routeRes) => {
          setRoute(routeRes.data);
          setActiveStepIndex(0);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, [id]);

  // Routable facilities
  const routableFacilities = facilities.filter((f) => f.navigationNodeId);

  // Group facilities
  const groupedFacilities = {
    "Entrances & Gates": routableFacilities.filter((f) => f.type === "entrance" || f.type === "ramp"),
    "Ticketing & Information": routableFacilities.filter((f) => f.type === "ticket_counter" || f.type === "information_counter" || f.type === "atm"),
    "Passenger Amenities": routableFacilities.filter((f) => f.type === "waiting_hall" || f.type === "food_canteen" || f.type === "drinking_water" || f.type === "restroom" || f.type === "first_aid"),
    "Platforms": routableFacilities.filter((f) => f.type === "platform"),
    "Stairs & Elevators": routableFacilities.filter((f) => f.type === "lift" || f.type === "stairs" || f.type === "escalator"),
  };

  const handleSwap = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
    setRoute(null);
  };

  const handleNavigate = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setRoute(null);
    setActiveStepIndex(0);

    if (!fromId || !toId) {
      setError("Please select both a starting point and a destination.");
      return;
    }
    if (fromId === toId) {
      setError("Starting point and destination cannot be the same.");
      return;
    }

    const fromFacility = facilities.find((f) => f._id === fromId);
    const toFacility = facilities.find((f) => f._id === toId);

    if (!fromFacility?.navigationNodeId || !toFacility?.navigationNodeId) {
      setError("Selected facility is not routable.");
      return;
    }

    setLoading(true);
    try {
      const res = await calculateRoute({
        stationId: id,
        fromNodeId: fromFacility.navigationNodeId,
        toNodeId: toFacility.navigationNodeId,
        wheelchair,
      });
      setRoute(res.data);
      setActiveStepIndex(0);

      if (res.data?.steps && res.data.steps.length > 0 && voiceEnabled) {
        speakInstruction(res.data.steps[0].instruction);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not calculate a route between the selected points.");
    } finally {
      setLoading(false);
    }
  };

  // Re-calculate route automatically when wheelchair mode toggles
  const handleWheelchairToggle = (newWheelchairVal) => {
    setWheelchair(newWheelchairVal);
    if (fromId && toId && fromId !== toId) {
      const fromFacility = facilities.find((f) => f._id === fromId);
      const toFacility = facilities.find((f) => f._id === toId);
      if (fromFacility && toFacility) {
        setLoading(true);
        calculateRoute({
          stationId: id,
          fromNodeId: fromFacility.navigationNodeId,
          toNodeId: toFacility.navigationNodeId,
          wheelchair: newWheelchairVal,
        })
          .then((res) => {
            setRoute(res.data);
            setActiveStepIndex(0);
            setError("");
          })
          .catch((err) => {
            setError(err.response?.data?.message || "No accessible route found.");
          })
          .finally(() => setLoading(false));
      }
    }
  };

  // Voice speech synthesis
  const speakInstruction = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleStepChange = (newIdx) => {
    setActiveStepIndex(newIdx);
    if (route?.steps && route.steps[newIdx] && voiceEnabled) {
      speakInstruction(route.steps[newIdx].instruction);
    }
  };

  const toggleVoice = () => {
    const nextVoice = !voiceEnabled;
    setVoiceEnabled(nextVoice);
    if (nextVoice && route?.steps && route.steps[activeStepIndex]) {
      speakInstruction(route.steps[activeStepIndex].instruction);
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  const currentStep = route?.steps && route.steps[activeStepIndex] ? route.steps[activeStepIndex] : null;
  const nextStep = route?.steps && route.steps[activeStepIndex + 1] ? route.steps[activeStepIndex + 1] : null;
  const isArrivalStep = currentStep?.action === "destination";

  // Calculate arrival time
  const getCalculatedArrivalTime = () => {
    const now = new Date();
    const walkMins = route?.totalDistance ? Math.max(1, Math.round(route.totalDistance / 65)) : 2;
    now.setMinutes(now.getMinutes() + walkMins);
    return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const toFacility = facilities.find((f) => f._id === toId);

  return (
    <div className="page navigation-page google-maps-theme-v2">
      {/* Top Header & Station Switcher */}
      <div className="nav-top-header">
        <div className="station-title-box">
          <div className="station-header-tags-row">
            <span className="station-code-pill-nav">{station?.stationCode}</span>
            {station?.division && (
              <span className="station-div-pill-nav">DIV: {station?.division}</span>
            )}
            {station?.category && (
              <span className="station-cat-pill-nav">{station?.category}</span>
            )}
          </div>
          <h2>{station ? station.stationName : "Loading Station..."}</h2>
          <p className="station-subtitle">
            📍 {station?.city}, {station?.region || "Tamil Nadu"} · 🚆 {station?.totalPlatforms} Platforms · ♿ Full Accessibility
          </p>
        </div>

        <div className="station-switch-dropdown">
          <label>Switch Station: </label>
          <select
            value={id}
            onChange={(e) => {
              navigate(`/stations/${e.target.value}/navigate`);
            }}
          >
            {/* Grouped by Tamil Nadu regions */}
            {["Chennai & Northern TN", "Kongu & Western TN", "Central & Cauvery Delta", "Southern TN"].map((reg) => {
              const matching = allStations.filter((s) => s.region === reg);
              if (matching.length === 0) return null;
              return (
                <optgroup key={reg} label={reg}>
                  {matching.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.stationName} ({s.stationCode}) · {s.totalPlatforms} Plat
                    </option>
                  ))}
                </optgroup>
              );
            })}
            {/* Fallback if any without region */}
            {allStations.filter((s) => !s.region).length > 0 && (
              <optgroup label="Other Stations">
                {allStations
                  .filter((s) => !s.region)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.stationName} ({s.stationCode})
                    </option>
                  ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Route Planning Box */}
      <div className="gmaps-route-card">
        <form className="gmaps-nav-form" onSubmit={handleNavigate}>
          <div className="inputs-column">
            {/* Start Field */}
            <div className="route-input-group">
              <span className="dot green"></span>
              <label>FROM:</label>
              <select value={fromId} onChange={(e) => { setFromId(e.target.value); setRoute(null); }}>
                <option value="">Choose Starting Point</option>
                {Object.entries(groupedFacilities).map(([group, facs]) =>
                  facs.length > 0 ? (
                    <optgroup key={group} label={group}>
                      {facs.map((f) => (
                        <option key={f._id} value={f._id}>
                          {ICONS[f.type] || "📍"} {f.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                )}
              </select>
            </div>

            {/* Destination Field */}
            <div className="route-input-group">
              <span className="dot red"></span>
              <label>TO:</label>
              <select value={toId} onChange={(e) => { setToId(e.target.value); setRoute(null); }}>
                <option value="">Choose Destination</option>
                {Object.entries(groupedFacilities).map(([group, facs]) =>
                  facs.length > 0 ? (
                    <optgroup key={group} label={group}>
                      {facs.map((f) => (
                        <option key={f._id} value={f._id}>
                          {ICONS[f.type] || "📍"} {f.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                )}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            className="swap-btn"
            onClick={handleSwap}
            title="Swap Starting Point and Destination"
          >
            ⇅
          </button>

          {/* Mode Selector and Submit */}
          <div className="actions-column">
            <div className="route-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${!wheelchair ? "active" : ""}`}
                onClick={() => handleWheelchairToggle(false)}
              >
                Standard Walk
              </button>
              <button
                type="button"
                className={`mode-btn ${wheelchair ? "active" : ""}`}
                onClick={() => handleWheelchairToggle(true)}
              >
                Wheelchair (Lifts & Ramps)
              </button>
            </div>

            <button type="submit" className="calc-route-btn" disabled={loading}>
              {loading ? "Finding Route..." : "Get Directions"}
            </button>
          </div>
        </form>

        {error && <p className="error-banner">⚠️ {error}</p>}
      </div>

      {/* ======================================================== */}
      {/* GOOGLE MAPS NAVIGATION LIVE VIEW */}
      {/* ======================================================== */}
      {route ? (
        <div className="gmaps-navigation-container">
          {/* Top Guidance Banner */}
          {currentStep && (
            <div className="gmaps-guidance-banner-v2">
              <div className="banner-main-row">
                <div className="guidance-icon-box">
                  <DirectionIcon action={currentStep.action} size={38} color="#ffffff" />
                </div>
                <div className="guidance-instruction-box">
                  <div className="guidance-step-tag">
                    {isArrivalStep
                      ? "Destination Reached"
                      : `towards ${currentStep.toNodeName || "Next Waypoint"}`}
                  </div>
                  <h3 className="guidance-main-text">{currentStep.instruction}</h3>
                  <div className="guidance-distance-milestone">
                    {isArrivalStep
                      ? `Arrived at ${toFacility?.name || "destination"}`
                      : `In ${currentStep.formattedDistance || `${currentStep.distance} m`} · Step ${activeStepIndex + 1} of ${route.steps.length}`}
                  </div>
                </div>

                <div className="guidance-actions-box">
                  <button
                    type="button"
                    className={`voice-audio-btn ${voiceEnabled ? "active" : ""}`}
                    onClick={toggleVoice}
                    title={voiceEnabled ? "Mute Voice Guidance" : "Enable Voice Guidance"}
                  >
                    {voiceEnabled ? "Voice: On" : "Voice: Off"}
                  </button>
                  <div className="step-arrow-controls">
                    <button
                      type="button"
                      disabled={activeStepIndex === 0}
                      onClick={() => handleStepChange(Math.max(0, activeStepIndex - 1))}
                      title="Previous Step"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={activeStepIndex >= route.steps.length - 1}
                      onClick={() => handleStepChange(Math.min(route.steps.length - 1, activeStepIndex + 1))}
                      title="Next Step"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-turn Preview */}
              {nextStep && nextStep.action !== "destination" && (
                <div className="guidance-sub-preview">
                  <span className="sub-then-label">Then</span>
                  <span className="sub-icon">
                    <DirectionIcon action={nextStep.action} size={16} color="#a7f3d0" />
                  </span>
                  <span className="sub-instruction">{nextStep.instruction}</span>
                </div>
              )}
            </div>
          )}

          {/* Interactive Layout: Left Steps, Right Map */}
          <div className="gmaps-body-layout">
            {/* Left: Direction Steps */}
            <div className="gmaps-directions-panel">
              <div className="panel-header-row">
                <div>
                  <h3 className="directions-title">Step-by-step Directions</h3>
                  <p className="directions-subtext">Click any step to highlight on the station map</p>
                </div>
                <span className="step-count-pill">{route.steps?.length || 0} Steps</span>
              </div>

              <div className="directions-step-list">
                {route.steps?.map((step, idx) => {
                  const isActive = activeStepIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`gmaps-step-item ${isActive ? "active" : ""}`}
                      onClick={() => handleStepChange(idx)}
                    >
                      <div className="step-icon-col">
                        <div className={`step-icon-circle ${isActive ? "active" : ""}`}>
                          <DirectionIcon
                            action={step.action}
                            size={18}
                            color={isActive ? "#ffffff" : "#38bdf8"}
                          />
                        </div>
                        {idx < route.steps.length - 1 && <div className="step-line-connector"></div>}
                      </div>
                      <div className="step-content-col">
                        <div className="step-header-row">
                          <span className="step-instruction">{step.instruction}</span>
                          {step.distance > 0 && (
                            <span className="step-distance-badge">{step.formattedDistance}</span>
                          )}
                        </div>
                        {step.detail && <p className="step-detail-note">{step.detail}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Map with Pedestrian Navigation Puck */}
            <div className="gmaps-map-panel">
              <MapView
                facilities={facilities}
                routeNodes={route.routeNodes}
                activeStepIndex={activeStepIndex}
                activeStep={currentStep}
                nextStep={nextStep}
                station={station}
                wheelchairMode={wheelchair}
                onSetStart={(f) => {
                  setFromId(f._id);
                  setRoute(null);
                }}
                onSetDestination={(f) => {
                  setToId(f._id);
                  setRoute(null);
                }}
              />
            </div>
          </div>

          {/* Bottom ETA Strip */}
          <div className="gmaps-bottom-hud-card">
            <button
              type="button"
              className="hud-cancel-circle-btn"
              onClick={() => setRoute(null)}
              title="End Navigation"
            >
              ✕
            </button>

            <div className="hud-eta-info">
              <div className="eta-main">
                <span className="eta-time">{route.estimatedWalkingTime || "~2 min walk"}</span>
              </div>
              <div className="eta-distance-row">
                <span>{route.formattedTotalDistance || `${route.totalDistance} m`}</span>
                <span className="hud-bullet">•</span>
                <span>ETA: {getCalculatedArrivalTime()}</span>
                <span className="hud-bullet">•</span>
                <span className="hud-badge">{wheelchair ? "Wheelchair Route" : "Walking Route"}</span>
              </div>
            </div>

            <button
              type="button"
              className="hud-audio-circle-btn"
              onClick={toggleVoice}
              title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
          </div>
        </div>
      ) : (
        /* Empty Preview Mode */
        <div className="gmaps-empty-preview">
          <MapView
            facilities={facilities}
            station={station}
            wheelchairMode={wheelchair}
            onSetStart={(f) => setFromId(f._id)}
            onSetDestination={(f) => setToId(f._id)}
          />
        </div>
      )}

      {/* Back Links */}
      <div className="back-link-bar">
        <Link to={`/stations/${id}`} className="back-link">
          ← Back to Station Overview
        </Link>
        <Link to="/stations" className="back-link secondary">
          View All Stations
        </Link>
      </div>
    </div>
  );
}

export default Navigation;
