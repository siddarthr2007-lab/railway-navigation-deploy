import { useEffect, useState } from "react";
import { getStations } from "../../services/stationService";
import { getFacilitiesByStation, createFacility, updateFacility, deleteFacility } from "../../services/facilityService";

const FACILITY_TYPES = [
  "platform", "ticket_counter", "waiting_hall", "restroom", "drinking_water",
  "food_canteen", "atm", "lift", "escalator", "stairs", "parking",
  "information_counter", "first_aid", "ramp", "entrance", "other",
];

const emptyForm = {
  name: "", type: "other", floor: 0, x: 100, y: 100, description: "",
  operatingHours: "24 Hours", wheelchairAccessible: false, liftAvailable: false, rampAvailable: false,
};

function FacilityManager() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("");
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { getStations().then((res) => setStations(res.data)); }, []);

  const loadFacilities = (sid) => {
    if (!sid) { setFacilities([]); return; }
    getFacilitiesByStation(sid).then((res) => setFacilities(res.data));
  };

  useEffect(() => { loadFacilities(stationId); }, [stationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : (["floor", "x", "y"].includes(name) ? Number(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stationId) { setMessage("Select a station first."); return; }

    const payload = {
      stationId,
      name: form.name,
      type: form.type,
      floor: form.floor,
      position: { x: form.x, y: form.y },
      description: form.description,
      operatingHours: form.operatingHours,
      wheelchairAccessible: form.wheelchairAccessible,
      liftAvailable: form.liftAvailable,
      rampAvailable: form.rampAvailable,
    };

    try {
      if (editingId) {
        await updateFacility(editingId, payload);
        setMessage("Facility updated.");
      } else {
        await createFacility(payload);
        setMessage("Facility created.");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadFacilities(stationId);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (f) => {
    setEditingId(f._id);
    setForm({
      name: f.name, type: f.type, floor: f.floor, x: f.position.x, y: f.position.y,
      description: f.description, operatingHours: f.operatingHours,
      wheelchairAccessible: f.wheelchairAccessible, liftAvailable: f.liftAvailable, rampAvailable: f.rampAvailable,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this facility?")) return;
    await deleteFacility(id);
    loadFacilities(stationId);
  };

  return (
    <div className="admin-section">
      <h3>Manage Facilities</h3>
      <label>
        Station:
        <select value={stationId} onChange={(e) => setStationId(e.target.value)}>
          <option value="">-- Select a station --</option>
          {stations.map((s) => <option key={s._id} value={s._id}>{s.stationName}</option>)}
        </select>
      </label>

      {stationId && (
        <>
          <form className="admin-form" onSubmit={handleSubmit}>
            <input name="name" placeholder="Facility name (e.g. Platform 6)" value={form.name} onChange={handleChange} required />
            <select name="type" value={form.type} onChange={handleChange}>
              {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
            <input name="floor" type="number" placeholder="Floor" value={form.floor} onChange={handleChange} />
            <input name="x" type="number" placeholder="Map X position" value={form.x} onChange={handleChange} />
            <input name="y" type="number" placeholder="Map Y position" value={form.y} onChange={handleChange} />
            <input name="operatingHours" placeholder="Operating Hours" value={form.operatingHours} onChange={handleChange} />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <label className="checkbox-label"><input type="checkbox" name="wheelchairAccessible" checked={form.wheelchairAccessible} onChange={handleChange} /> Wheelchair Accessible</label>
            <label className="checkbox-label"><input type="checkbox" name="liftAvailable" checked={form.liftAvailable} onChange={handleChange} /> Lift Available</label>
            <label className="checkbox-label"><input type="checkbox" name="rampAvailable" checked={form.rampAvailable} onChange={handleChange} /> Ramp Available</label>
            <div className="form-actions">
              <button type="submit">{editingId ? "Update Facility" : "Add Facility"}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
            </div>
          </form>
          {message && <p className="note">{message}</p>}

          <table className="admin-table">
            <thead><tr><th>Name</th><th>Type</th><th>Position</th><th>Actions</th></tr></thead>
            <tbody>
              {facilities.map((f) => (
                <tr key={f._id}>
                  <td>{f.name}</td>
                  <td>{f.type}</td>
                  <td>({f.position.x}, {f.position.y})</td>
                  <td>
                    <button onClick={() => handleEdit(f)}>Edit</button>
                    <button onClick={() => handleDelete(f._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default FacilityManager;
