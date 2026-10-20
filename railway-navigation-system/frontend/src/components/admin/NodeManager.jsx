import { useEffect, useState } from "react";
import { getStations } from "../../services/stationService";
import { getNodes, createNode, updateNode, deleteNode } from "../../services/navigationService";

const emptyForm = { nodeName: "", floor: 0, x: 100, y: 100, isAccessible: true };

function NodeManager() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState("");
  const [nodes, setNodes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => { getStations().then((res) => setStations(res.data)); }, []);

  const loadNodes = (sid) => {
    if (!sid) { setNodes([]); return; }
    getNodes(sid).then((res) => setNodes(res.data));
  };
  useEffect(() => { loadNodes(stationId); }, [stationId]);

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
      stationId, nodeName: form.nodeName, floor: form.floor,
      position: { x: form.x, y: form.y }, isAccessible: form.isAccessible,
    };
    try {
      if (editingId) { await updateNode(editingId, payload); setMessage("Node updated."); }
      else { await createNode(payload); setMessage("Node created."); }
      setForm(emptyForm);
      setEditingId(null);
      loadNodes(stationId);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (n) => {
    setEditingId(n._id);
    setForm({ nodeName: n.nodeName, floor: n.floor, x: n.position.x, y: n.position.y, isAccessible: n.isAccessible });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this node? Any paths using it will break.")) return;
    await deleteNode(id);
    loadNodes(stationId);
  };

  return (
    <div className="admin-section">
      <h3>Manage Navigation Nodes</h3>
      <p className="note">Nodes are the "dots" on the map graph used for route calculation (Dijkstra's algorithm).</p>
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
            <input name="nodeName" placeholder="Node name (e.g. Junction-2)" value={form.nodeName} onChange={handleChange} required />
            <input name="floor" type="number" placeholder="Floor" value={form.floor} onChange={handleChange} />
            <input name="x" type="number" placeholder="Map X position" value={form.x} onChange={handleChange} />
            <input name="y" type="number" placeholder="Map Y position" value={form.y} onChange={handleChange} />
            <label className="checkbox-label"><input type="checkbox" name="isAccessible" checked={form.isAccessible} onChange={handleChange} /> Wheelchair accessible point</label>
            <div className="form-actions">
              <button type="submit">{editingId ? "Update Node" : "Add Node"}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}
            </div>
          </form>
          {message && <p className="note">{message}</p>}

          <table className="admin-table">
            <thead><tr><th>Name</th><th>Position</th><th>Accessible</th><th>Actions</th></tr></thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n._id}>
                  <td>{n.nodeName}</td>
                  <td>({n.position.x}, {n.position.y})</td>
                  <td>{n.isAccessible ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => handleEdit(n)}>Edit</button>
                    <button onClick={() => handleDelete(n._id)}>Delete</button>
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

export default NodeManager;
