import { useRef, useState, useEffect } from "react";
import { ICONS } from "./FacilityCard";

// Architectural Viewport Canvas
const VIEW_WIDTH = 920;
const VIEW_HEIGHT = 620;

function MapView({
  facilities = [],
  routeNodes = [],
  activeStepIndex = null,
  activeStep = null,
  nextStep = null,
  onFacilityClick,
  selectedFacilityId,
  onSetStart,
  onSetDestination,
  station = null,
  wheelchairMode = false,
}) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [hoveredFacility, setHoveredFacility] = useState(null);
  const [theme, setTheme] = useState("light"); // "light" default, can toggle "dark"
  const [filterSearch, setFilterSearch] = useState("");
  const [showSearchBox, setShowSearchBox] = useState(false);

  const dragState = useRef({ dragging: false, startX: 0, startY: 0 });

  // Pan & Drag Handlers
  const handleMouseDown = (e) => {
    dragState.current = {
      dragging: true,
      startX: e.clientX - translate.x,
      startY: e.clientY - translate.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragState.current.dragging) return;
    setTranslate({
      x: e.clientX - dragState.current.startX,
      y: e.clientY - dragState.current.startY,
    });
  };

  const stopDrag = () => {
    dragState.current.dragging = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale((s) => Math.min(3.0, Math.max(0.65, s + delta)));
  };

  const zoomIn = () => setScale((s) => Math.min(3.0, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(0.65, s - 0.25));
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  // Center on active step or route
  const recenterOnActiveStep = () => {
    if (routeNodes && routeNodes.length > 0) {
      const idx = activeStepIndex !== null && activeStepIndex < routeNodes.length ? activeStepIndex : 0;
      const targetNode = routeNodes[idx] || routeNodes[0];
      if (targetNode && targetNode.position) {
        const targetTransX = (VIEW_WIDTH / 2 - targetNode.position.x) * 0.9;
        const targetTransY = (VIEW_HEIGHT / 2 - targetNode.position.y) * 0.9;
        setTranslate({ x: targetTransX, y: targetTransY });
        setScale(1.25);
        return;
      }
    }
    resetView();
  };

  // Center on route change
  useEffect(() => {
    if (routeNodes && routeNodes.length > 1) {
      const xs = routeNodes.map((n) => n.position.x);
      const ys = routeNodes.map((n) => n.position.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const routeCenterX = (minX + maxX) / 2;
      const routeCenterY = (minY + maxY) / 2;

      const targetTransX = (VIEW_WIDTH / 2 - routeCenterX) * 0.75;
      const targetTransY = (VIEW_HEIGHT / 2 - routeCenterY) * 0.75;
      setTranslate({ x: targetTransX, y: targetTransY });
      setScale(1.08);
    }
  }, [routeNodes]);

  // Determine platform count for station
  const platformCount =
    station?.totalPlatforms ||
    facilities.filter((f) => f.type === "platform").length ||
    6;

  // Active step coordinates and direction angle for Google Maps Pedestrian Blue Dot
  let activeSegment = null;
  let userPos = null;
  let walkAngle = 0;

  if (routeNodes && routeNodes.length > 0) {
    const currIdx =
      activeStepIndex !== null && activeStepIndex < routeNodes.length - 1
        ? activeStepIndex
        : 0;

    const fromNode = routeNodes[currIdx];
    const toNode = routeNodes[currIdx + 1] || routeNodes[currIdx];

    if (fromNode && fromNode.position) {
      userPos = { x: fromNode.position.x, y: fromNode.position.y };

      if (toNode && toNode.position && (fromNode.position.x !== toNode.position.x || fromNode.position.y !== toNode.position.y)) {
        const dx = toNode.position.x - fromNode.position.x;
        const dy = toNode.position.y - fromNode.position.y;
        walkAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

        activeSegment = {
          x1: fromNode.position.x,
          y1: fromNode.position.y,
          x2: toNode.position.x,
          y2: toNode.position.y,
          toName: toNode.nodeName || "Next Waypoint",
        };
      }
    }
  }

  const routePoints = routeNodes.map((n) => `${n.position.x},${n.position.y}`).join(" ");
  const startNode = routeNodes && routeNodes.length > 0 ? routeNodes[0] : null;
  const endNode = routeNodes && routeNodes.length > 1 ? routeNodes[routeNodes.length - 1] : null;

  // Station platforms layout
  const platformTracks = [];
  for (let i = 1; i <= platformCount; i++) {
    const xPos = 120 + Math.round((i - 1) * (680 / Math.max(platformCount - 1, 1)));
    platformTracks.push({
      num: i,
      x: xPos,
    });
  }

  const isDark = theme === "dark";

  // Filter facilities if search query is entered
  const displayedFacilities = filterSearch
    ? facilities.filter(
        (f) =>
          f.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
          f.type.toLowerCase().includes(filterSearch.toLowerCase())
      )
    : facilities;

  return (
    <div className={`map-wrapper google-maps-style ${isDark ? "theme-dark" : "theme-light"}`}>
      {/* Top Map Controls Bar */}
      <div className="gmaps-map-header">
        <div className="header-left-actions">
          <button
            type="button"
            className="hud-pill-btn"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title="Toggle Day/Night View"
          >
            {isDark ? "Night Mode" : "Day Mode"}
          </button>
          <span className="station-view-indicator">
            {station ? `${station.stationName} (${station.stationCode})` : "Station Floorplan"}
          </span>
        </div>

        <div className="header-right-legend">
          <span className="legend-chip green">
            <span className="dot green"></span> Start
          </span>
          <span className="legend-chip red">
            <span className="dot red"></span> Destination
          </span>
          <span className="legend-chip cyan">
            <span className="dot cyan"></span> Route
          </span>
        </div>
      </div>

      <div className="svg-container" style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="map-svg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onWheel={handleWheel}
        >
          <defs>
            {/* Luminous Route Glow */}
            <filter id="neonRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#00e5ff" floodOpacity="0.8" />
            </filter>

            {/* Active Turn Segment Highlight */}
            <filter id="activeSegmentGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>

            {/* Pedestrian Vision Cone / Beam Gradient */}
            <linearGradient id="pedestrianVisionBeam" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </linearGradient>

            {/* Start Node Pulse Ring */}
            <radialGradient id="startPulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>

            {/* Destination Node Pulse Ring */}
            <radialGradient id="destPulseGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
            {/* Background Canvas */}
            <rect
              x="0"
              y="0"
              width={VIEW_WIDTH}
              height={VIEW_HEIGHT}
              fill={isDark ? "#0d1726" : "#f8fafc"}
            />

            {/* Subtle Station Floor Grid */}
            <g stroke={isDark ? "#162238" : "#e2e8f0"} strokeWidth="1" opacity="0.5">
              {[...Array(19)].map((_, i) => (
                <line key={`grid-v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2={VIEW_HEIGHT} />
              ))}
              {[...Array(13)].map((_, i) => (
                <line key={`grid-h-${i}`} x1="0" y1={i * 50} x2={VIEW_WIDTH} y2={i * 50} />
              ))}
            </g>

            {/* ======================================================== */}
            {/* --- STATION ARCHITECTURAL ZONES --- */}
            {/* ======================================================== */}

            {/* 1. PLATFORM TRACKS ZONE (TOP) */}
            <rect
              x="40"
              y="32"
              width="840"
              height="118"
              rx="10"
              fill={isDark ? "#101b2b" : "#f1f5f9"}
              stroke={isDark ? "#1e2f46" : "#cbd5e1"}
              strokeWidth="1.2"
            />
            <text
              x="55"
              y="48"
              fontSize="9"
              fontWeight="700"
              fill={isDark ? "#475569" : "#94a3b8"}
              letterSpacing="1"
            >
              PLATFORM TRACKS
            </text>

            {/* Railway Tracks & Sleepers */}
            <g>
              {platformTracks.map((pt) => (
                <g key={`pt-${pt.num}`}>
                  {/* Track bed */}
                  <rect
                    x={pt.x - 20}
                    y="52"
                    width="40"
                    height="88"
                    rx="4"
                    fill={isDark ? "#0b121d" : "#e2e8f0"}
                    stroke={isDark ? "#172335" : "#cbd5e1"}
                    strokeWidth="1"
                  />
                  {/* Steel Rails */}
                  <line x1={pt.x - 9} y1="54" x2={pt.x - 9} y2="136" stroke={isDark ? "#334155" : "#94a3b8"} strokeWidth="1.8" />
                  <line x1={pt.x + 9} y1="54" x2={pt.x + 9} y2="136" stroke={isDark ? "#334155" : "#94a3b8"} strokeWidth="1.8" />
                  {/* Sleepers */}
                  {[...Array(5)].map((_, si) => (
                    <line
                      key={`s-${si}`}
                      x1={pt.x - 12}
                      y1={62 + si * 16}
                      x2={pt.x + 12}
                      y2={62 + si * 16}
                      stroke={isDark ? "#1e293b" : "#cbd5e1"}
                      strokeWidth="2"
                    />
                  ))}
                </g>
              ))}
            </g>

            {/* 2. CENTRAL FOOT OVERBRIDGE (FOB SKYWALK: Y 168 - 208) */}
            <rect
              x="50"
              y="168"
              width="820"
              height="38"
              rx="8"
              fill={isDark ? "#13233a" : "#e0e7ff"}
              stroke={isDark ? "#1d4ed8" : "#818cf8"}
              strokeWidth="1.8"
              strokeDasharray="5 3"
            />
            {/* FOB Vertical Platform Connectors */}
            {platformTracks.map((pt) => (
              <line
                key={`fob-conn-${pt.num}`}
                x1={pt.x}
                y1="140"
                x2={pt.x}
                y2="168"
                stroke={isDark ? "#38bdf8" : "#6366f1"}
                strokeWidth="1.8"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            ))}
            <text
              x={VIEW_WIDTH / 2}
              y="192"
              fontSize="10"
              fontWeight="700"
              fill={isDark ? "#60a5fa" : "#4338ca"}
              textAnchor="middle"
              letterSpacing="1"
            >
              FOOT OVERBRIDGE (FOB SKYWALK) · STAIRS & ELEVATORS
            </text>

            {/* 3. MAIN CONCOURSE & PASSENGER AMENITIES (MIDDLE: Y 230 - 475) */}
            <rect
              x="60"
              y="230"
              width="800"
              height="245"
              rx="14"
              fill={isDark ? "#111c2e" : "#ffffff"}
              stroke={isDark ? "#1e2f46" : "#cbd5e1"}
              strokeWidth="1.5"
            />

            {/* Subtle Concourse Section Dividers (No text collision) */}
            <g>
              {/* Ticketing & Help Wing */}
              <rect
                x="80"
                y="410"
                width="360"
                height="50"
                rx="6"
                fill={isDark ? "#142135" : "#f8fafc"}
                stroke={isDark ? "#1e2f46" : "#e2e8f0"}
                strokeWidth="1"
              />
              <text x="92" y="424" fontSize="8.5" fontWeight="600" fill={isDark ? "#64748b" : "#94a3b8"} letterSpacing="0.8">
                TICKETING & ATVM
              </text>

              {/* Passenger Services Wing */}
              <rect
                x="480"
                y="410"
                width="360"
                height="50"
                rx="6"
                fill={isDark ? "#142135" : "#f8fafc"}
                stroke={isDark ? "#1e2f46" : "#e2e8f0"}
                strokeWidth="1"
              />
              <text x="492" y="424" fontSize="8.5" fontWeight="600" fill={isDark ? "#64748b" : "#94a3b8"} letterSpacing="0.8">
                HELP DESK, FIRST AID & ATMS
              </text>

              {/* Waiting Lounges & Food Court */}
              <rect
                x="80"
                y="318"
                width="760"
                height="62"
                rx="6"
                fill={isDark ? "#132033" : "#f1f5f9"}
                stroke={isDark ? "#1e2f46" : "#e2e8f0"}
                strokeWidth="1"
              />
              <text x="92" y="332" fontSize="8.5" fontWeight="600" fill={isDark ? "#64748b" : "#94a3b8"} letterSpacing="0.8">
                PASSENGER LOUNGES & RESTROOMS
              </text>

              {/* Skywalk Access Corridor */}
              <rect
                x="280"
                y="245"
                width="360"
                height="46"
                rx="6"
                fill={isDark ? "#15243b" : "#eff6ff"}
                stroke={isDark ? "#1e3a5f" : "#bfdbfe"}
                strokeWidth="1"
              />
              <text x="292" y="258" fontSize="8.5" fontWeight="600" fill={isDark ? "#38bdf8" : "#1d4ed8"} letterSpacing="0.8">
                OVERBRIDGE LIFTS & STAIRS ACCESS
              </text>
            </g>

            <text
              x="75"
              y="245"
              fontSize="10"
              fontWeight="700"
              fill={isDark ? "#64748b" : "#94a3b8"}
              letterSpacing="1"
            >
              MAIN CONCOURSE
            </text>

            {/* 4. STATION ENTRANCE GATES & PORTICO (BOTTOM: Y 498 - 570) */}
            <rect
              x="80"
              y="498"
              width="760"
              height="70"
              rx="10"
              fill={isDark ? "#0f1826" : "#f8fafc"}
              stroke={isDark ? "#1e2c3e" : "#cbd5e1"}
              strokeWidth="1.2"
              strokeDasharray="6 3"
            />
            <line x1="90" y1="548" x2="830" y2="548" stroke={isDark ? "#213247" : "#cbd5e1"} strokeWidth="1.5" strokeDasharray="8 6" />
            <text
              x={VIEW_WIDTH / 2}
              y="516"
              fontSize="10"
              fontWeight="700"
              fill={isDark ? "#64748b" : "#475569"}
              textAnchor="middle"
              letterSpacing="1"
            >
              STATION ENTRANCE GATES & PASSENGER PORTICO
            </text>

            {/* ======================================================== */}
            {/* --- LUMINOUS ROUTE LINE (GOOGLE MAPS STYLE) --- */}
            {/* ======================================================== */}
            {routeNodes.length > 1 && (
              <g>
                {/* 1. Luminous Cyan Outer Glow */}
                <polyline
                  points={routePoints}
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isDark ? 0.4 : 0.2}
                  filter="url(#neonRouteGlow)"
                />

                {/* 2. Main Navigation Line */}
                <polyline
                  points={routePoints}
                  fill="none"
                  stroke={isDark ? "#00e5ff" : "#0284c7"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* 3. Directional Pulse Dots */}
                <polyline
                  points={routePoints}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 12"
                  opacity="0.85"
                />
              </g>
            )}

            {/* ======================================================== */}
            {/* --- ACTIVE STEP SEGMENT HIGHLIGHT --- */}
            {/* ======================================================== */}
            {activeSegment && (
              <g filter="url(#activeSegmentGlow)">
                <line
                  x1={activeSegment.x1}
                  y1={activeSegment.y1}
                  x2={activeSegment.x2}
                  y2={activeSegment.y2}
                  stroke="#38bdf8"
                  strokeWidth="7"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <circle cx={activeSegment.x1} cy={activeSegment.y1} r="5" fill="#38bdf8" />
                <circle cx={activeSegment.x2} cy={activeSegment.y2} r="5" fill="#38bdf8" />

                {/* Floating Turn Badge on the Map */}
                <g transform={`translate(${(activeSegment.x1 + activeSegment.x2) / 2}, ${(activeSegment.y1 + activeSegment.y2) / 2 - 16})`}>
                  <rect
                    x="-70"
                    y="-11"
                    width="140"
                    height="22"
                    rx="11"
                    fill="#0369a1"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                  />
                  <text
                    x="0"
                    y="4"
                    fontSize="9.5"
                    fontWeight="700"
                    fill="#ffffff"
                    textAnchor="middle"
                  >
                    → {activeSegment.toName.length > 18 ? activeSegment.toName.substring(0, 16) + "…" : activeSegment.toName}
                  </text>
                </g>
              </g>
            )}

            {/* ======================================================== */}
            {/* --- GOOGLE MAPS PEDESTRIAN NAVIGATION PUCK --- */}
            {/* (Authentic Blue GPS Dot with directional beam) */}
            {/* ======================================================== */}
            {userPos && (
              <g
                transform={`translate(${userPos.x}, ${userPos.y}) rotate(${walkAngle})`}
                className="pedestrian-puck-group"
              >
                {/* 1. Forward Directional Vision / Beam Cone */}
                <path
                  d="M 6 -3 L 42 -18 L 42 18 L 6 3 Z"
                  fill="url(#pedestrianVisionBeam)"
                />

                {/* 2. Outer Soft GPS Accuracy Ring */}
                <circle cx="0" cy="0" r="15" fill="#0284c7" opacity="0.25" />

                {/* 3. Solid White Ring Border */}
                <circle cx="0" cy="0" r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />

                {wheelchairMode ? (
                  /* Wheelchair Mode Indicator */
                  <text x="0" y="3" textAnchor="middle" fontSize="9" fill="#ffffff">
                    ♿
                  </text>
                ) : (
                  /* Pedestrian Direction Arrow pointing forward */
                  <polygon points="5,0 -2,-3 -1,0 -2,3" fill="#ffffff" />
                )}
              </g>
            )}

            {/* ======================================================== */}
            {/* --- START & DESTINATION PINS --- */}
            {/* ======================================================== */}
            {startNode && (
              <g transform={`translate(${startNode.position.x}, ${startNode.position.y})`}>
                <circle r="18" fill="url(#startPulseGlow)" />
                <circle r="10" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <circle r="3.5" fill="#ffffff" />
                <rect x="-20" y="-25" width="40" height="15" rx="3" fill="#10b981" />
                <text x="0" y="-14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                  START
                </text>
              </g>
            )}

            {endNode && (
              <g transform={`translate(${endNode.position.x}, ${endNode.position.y})`}>
                <circle r="18" fill="url(#destPulseGlow)" />
                <circle r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <circle r="3.5" fill="#ffffff" />
                <rect x="-24" y="-25" width="48" height="15" rx="3" fill="#ef4444" />
                <text x="0" y="-14" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ffffff">
                  ARRIVE
                </text>
              </g>
            )}

            {/* ======================================================== */}
            {/* --- STATION FACILITY PINS --- */}
            {/* ======================================================== */}
            {displayedFacilities.map((f) => {
              const isSelected = selectedFacilityId === f._id;
              const isStart = startNode && f.navigationNodeId === startNode._id;
              const isEnd = endNode && f.navigationNodeId === endNode._id;
              const isPlatform = f.type === "platform";

              return (
                <g
                  key={f._id}
                  transform={`translate(${f.position.x}, ${f.position.y})`}
                  className="facility-marker"
                  style={{ cursor: "pointer" }}
                  onClick={() => onFacilityClick && onFacilityClick(f)}
                  onMouseEnter={() => setHoveredFacility(f)}
                  onMouseLeave={() => setHoveredFacility(null)}
                >
                  {/* Selection Ring */}
                  {(isSelected || isStart || isEnd) && (
                    <circle
                      r="18"
                      fill="none"
                      stroke={isStart ? "#10b981" : isEnd ? "#ef4444" : "#f59e0b"}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Marker Pin */}
                  <circle
                    r="13"
                    fill={
                      isDark
                        ? isSelected
                          ? "#78350f"
                          : isPlatform
                          ? "#1e3a8a"
                          : "#1e293b"
                        : isSelected
                        ? "#fef3c7"
                        : isPlatform
                        ? "#e0f2fe"
                        : "#ffffff"
                    }
                    stroke={
                      isSelected
                        ? "#f59e0b"
                        : isStart
                        ? "#10b981"
                        : isEnd
                        ? "#ef4444"
                        : isDark
                        ? "#475569"
                        : "#cbd5e1"
                    }
                    strokeWidth="1.5"
                  />

                  {/* Facility Icon */}
                  <text textAnchor="middle" dy="4" fontSize="11">
                    {ICONS[f.type] || "📍"}
                  </text>

                  {/* Crisp, non-overlapping label */}
                  <text
                    textAnchor="middle"
                    dy={isPlatform ? 24 : 22}
                    fontSize="9"
                    fontWeight="600"
                    fill={isDark ? "#f1f5f9" : "#0f172a"}
                    paintOrder="stroke"
                    stroke={isDark ? "#0d1726" : "#ffffff"}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {f.name.length > 18 ? f.name.substring(0, 16) + "…" : f.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Right HUD Controls */}
        <div className="gmaps-floating-controls">
          {/* Compass (Click to reset view) */}
          <button
            type="button"
            className="floating-compass-btn"
            onClick={resetView}
            title="Reset North"
          >
            <svg width="24" height="24" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <polygon points="16,5 12,16 16,14" fill="#ef4444" />
              <polygon points="16,5 20,16 16,14" fill="#dc2626" />
              <polygon points="16,27 12,16 16,18" fill="#ffffff" />
              <polygon points="16,27 20,16 16,18" fill="#cbd5e1" />
            </svg>
          </button>

          {/* Quick Search */}
          <button
            type="button"
            className={`floating-tool-btn ${showSearchBox ? "active" : ""}`}
            onClick={() => setShowSearchBox(!showSearchBox)}
            title="Search Facility"
          >
            🔍
          </button>

          {/* Zoom In & Out */}
          <div className="zoom-group">
            <button type="button" onClick={zoomIn} title="Zoom In">+</button>
            <button type="button" onClick={zoomOut} title="Zoom Out">−</button>
          </div>
        </div>

        {/* Quick Search Popout */}
        {showSearchBox && (
          <div className="floating-search-bar">
            <input
              type="text"
              placeholder="Find platform, ticket, restroom..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              autoFocus
            />
            {filterSearch && (
              <button type="button" onClick={() => setFilterSearch("")}>✕</button>
            )}
          </div>
        )}

        {/* Bottom Re-centre Button */}
        <div className="gmaps-bottom-pills-row">
          <button
            type="button"
            className="bottom-pill-btn recenter"
            onClick={recenterOnActiveStep}
            title="Re-centre camera on current step"
          >
            <span className="pill-arrow">▲</span> Re-centre
          </button>
        </div>

        {/* Facility Hover Tooltip */}
        {hoveredFacility && (
          <div className={`map-facility-tooltip ${isDark ? "dark-card" : "light-card"}`}>
            <div className="tooltip-header">
              <span className="tooltip-icon">{ICONS[hoveredFacility.type] || "📍"}</span>
              <div>
                <strong>{hoveredFacility.name}</strong>
                <p>{hoveredFacility.description || hoveredFacility.type.replace(/_/g, " ")}</p>
              </div>
            </div>
            <div className="tooltip-actions">
              {onSetStart && (
                <button
                  type="button"
                  className="quick-route-btn start"
                  onClick={() => onSetStart(hoveredFacility)}
                >
                  Set as Start
                </button>
              )}
              {onSetDestination && (
                <button
                  type="button"
                  className="quick-route-btn dest"
                  onClick={() => onSetDestination(hoveredFacility)}
                >
                  Set as Destination
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="map-bottom-statusbar">
        <span>Drag to pan · Scroll to zoom · Click facility to route</span>
      </div>
    </div>
  );
}

export default MapView;
