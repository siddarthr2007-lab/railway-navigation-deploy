const ICONS = {
  platform: "🚉", ticket_counter: "🎫", waiting_hall: "🪑", restroom: "🚻",
  drinking_water: "🚰", food_canteen: "🍽️", atm: "🏧", lift: "🛗",
  escalator: "↗️", stairs: "🪜", parking: "🅿️", information_counter: "ℹ️",
  first_aid: "⛑️", ramp: "♿", entrance: "🚪", other: "📍",
};

function FacilityCard({ facility, onClick }) {
  return (
    <div className="facility-card" onClick={() => onClick && onClick(facility)}>
      <span className="facility-icon">{ICONS[facility.type] || "📍"}</span>
      <div>
        <h4>{facility.name}</h4>
        <p className="facility-type">{facility.type.replace(/_/g, " ")}</p>
        {facility.wheelchairAccessible && <span className="badge">♿ Accessible</span>}
      </div>
    </div>
  );
}

export default FacilityCard;
export { ICONS };
