import { useState } from "react";
import { Navigate } from "react-router-dom";
import StationManager from "../components/admin/StationManager";
import FacilityManager from "../components/admin/FacilityManager";
import NodeManager from "../components/admin/NodeManager";
import PathManager from "../components/admin/PathManager";

const TABS = [
  { key: "stations", label: "Stations", Component: StationManager },
  { key: "facilities", label: "Facilities", Component: FacilityManager },
  { key: "nodes", label: "Map Nodes", Component: NodeManager },
  { key: "paths", label: "Map Paths", Component: PathManager },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("stations");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const ActiveComponent = TABS.find((t) => t.key === activeTab).Component;

  return (
    <div className="page admin-dashboard-page">
      <h2>Admin Dashboard</h2>
      <p>Logged in as <strong>{localStorage.getItem("adminUsername")}</strong></p>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={activeTab === t.key ? "tab active" : "tab"}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
}

export default AdminDashboard;
