import { useEffect, useState } from "react";
import { getStations, createStation, updateStation, deleteStation } from "../../services/stationService";

const emptyForm = { stationCode: "", stationName: "", city: "", state: "Tamil Nadu", description: "", totalPlatforms: 0 };

function StationManager() {
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => getStations().then((res) => setStations(res.data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "totalPlatforms" ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateStation(editingId, form);
        setMessage("Station updated.");
      } else {
        await createStation(form);
        setMessage("Station created.");
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (station) => {
    setEditingId(station._id);
    setForm({
      stationCode: station.stationCode,
      stationName: station.stationName,
      city: station.city,
      state: station.state,
      description: station.description,
      totalPlatforms: station.totalPlatforms,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this station? This does not delete its facilities.")) return;
    await deleteStation(id);
    load();
  };

  return (
    <div className="admin-section">
      <h3>Manage Stations</h3>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input name="stationCode" placeholder="Code (e.g. MAS)" value={form.stationCode} onChange={handleChange} required />
        <input name="stationName" placeholder="Station Name" value={form.stationName} onChange={handleChange} required />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required />
        <input name="totalPlatforms" type="number" placeholder="Total Platforms" value={form.totalPlatforms} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <div className="form-actions">
          <button type="submit">{editingId ? "Update Station" : "Add Station"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
        </div>
      </form>
      {message && <p className="note">{message}</p>}

      <table className="admin-table">
        <thead><tr><th>Code</th><th>Name</th><th>City</th><th>Platforms</th><th>Actions</th></tr></thead>
        <tbody>
          {stations.map((s) => (
            <tr key={s._id}>
              <td>{s.stationCode}</td>
              <td>{s.stationName}</td>
              <td>{s.city}</td>
              <td>{s.totalPlatforms}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StationManager;
