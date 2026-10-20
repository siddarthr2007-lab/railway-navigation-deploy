import { useEffect, useState } from "react";
import { getStations } from "../../services/stationService";
import { getNodes, getPaths, createPath, updatePath, deletePath } from "../../services/navigationService";

const PATH_TYPES = ["walkway", "stairs", "lift", "escalator", "ramp"];
const emptyForm = { fromNode: "", toNode: "", distance: 10, pathType: "walkway", isWheelchairAccessible: true, instruction: "Go straight" };

function PathManager() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("");
  const [nodes, setNodes] = useState([]);
  const [paths, setPaths] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { getStations().then((res) => setStations(res.data)); }, []);

  const load = (sid) => {
    if (!sid) { setNodes([]); setPaths([]); return; }
    getNodes(sid).then((res) => setNodes(res.data));
    getPaths(sid).then((res) => setPaths(res.data));
  };
  useEffect(() => { load(stationId); }, [stationId]);

  const nodeName = (id) => nodes.find((n) => n._id === id)?.nodeName || "?";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : (name === "distance" ? Number(value) : value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stationId) { setMessage("Select a station first."); return; }
    if (form.fromNode === form.toNode) { setMessage("From and To nodes must be different."); return; }
    const payload = { stationId, ...form };
    try {
      if (editingId) { await updatePath(editingId, payload); setMessage("Path updated."); }
      else { await createPath(payload); setMessage("Path created."); }
      setForm(emptyForm);
      setEditingId(null);
      load(stationId);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      fromNode: p.fromNode, toNode: p.toNode, distance: p.distance,
      pathType: p.pathType, isWheelchairAccessible: p.isWheelchairAccessible, instruction: p.instruction,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this path?")) return;
    await deletePath(id);
    load(stationId);
  };

  return (
    <div className="admin-section">
      <h3>Manage Navigation Paths</h3>
      <p className="note">Paths connect two nodes and carry the "distance" (weight) Dijkstra's algorithm uses, plus accessibility info.</p>
      <label>
        Station:
        <select value={stationId} onChange={(e) => setStationId(e.target.value)}>
          <option value="">-- Select a station --</option>
          {stations.map((s) => <option key={s._id} value={s._id}>{s.stationName}</option>)}
        </select>
      </label>

      {stationId && (
        <>
          {nodes.length < 2 ? (
            <p className="note">Add at least 2 navigation nodes for this station first.</p>
          ) : (
            <form className="admin-form" onSubmit={handleSubmit}>
              <select name="fromNode" value={form.fromNode} onChange={handleChange} required>
                <option value="">-- From node --</option>
                {nodes.map((n) => <option key={n._id} value={n._id}>{n.nodeName}</option>)}
              </select>
              <select name="toNode" value={form.toNode} onChange={handleChange} required>
                <option value="">-- To node --</option>
                {nodes.map((n) => <option key={n._id} value={n._id}>{n.nodeName}</option>)}
              </select>
              <input name="distance" type="number" placeholder="Distance" value={form.distance} onChange={handleChange} required />
              <select name="pathType" value={form.pathType} onChange={handleChange}>
                {PATH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input name="instruction" placeholder="Instruction (e.g. Turn left)" value={form.instruction} onChange={handleChange} />
              <label className="checkbox-label">
                <input type="checkbox" name="isWheelchairAccessible" checked={form.isWheelchairAccessible} onChange={handleChange} />
                Wheelchair accessible (uncheck for stairs)
              </label>
              <div className="form-actions">
                <button type="submit">{editingId ? "Update Path" : "Add Path"}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
              </div>
            </form>
          )}
          {message && <p className="note">{message}</p>}

          <table className="admin-table">
            <thead><tr><th>From</th><th>To</th><th>Distance</th><th>Type</th><th>Accessible</th><th>Actions</th></tr></thead>
            <tbody>
              {paths.map((p) => (
                <tr key={p._id}>
                  <td>{nodeName(p.fromNode)}</td>
                  <td>{nodeName(p.toNode)}</td>
                  <td>{p.distance}</td>
                  <td>{p.pathType}</td>
                  <td>{p.isWheelchairAccessible ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
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

export default PathManager;
