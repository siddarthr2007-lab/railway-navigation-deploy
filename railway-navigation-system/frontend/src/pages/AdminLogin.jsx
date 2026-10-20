import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/adminService";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await loginAdmin({ username, password });
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminUsername", res.data.admin.username);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page admin-login-page">
      <h2>Admin Login</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p className="note">Default seeded admin: username <code>admin</code>, password <code>admin123</code></p>
    </div>
  );
}

export default AdminLogin;
