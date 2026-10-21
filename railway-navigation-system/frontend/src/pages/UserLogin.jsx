import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginUser, registerUser } from "../services/userService";

function UserLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check query param for default mode: /login?mode=register
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredAccessibility, setPreferredAccessibility] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // If already logged in, redirect to profile or stations
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isUserLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/profile");
    }
  }, [navigate]);

  // Sync mode if query param changes
  useEffect(() => {
    if (queryParams.get("mode") === "register") {
      setMode("register");
    }
  }, [location.search]);

  // Handle Demo Passenger Quick Fill
  const handleQuickDemo = (e) => {
    e.preventDefault();
    setMode("login");
    setEmail("passenger@navigo.com");
    setPassword("user123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginUser({ email, password });
        const userData = res.data.user;

        // Store user in localStorage
        localStorage.setItem("isUserLoggedIn", "true");
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userPhone", userData.phone || "");
        localStorage.setItem("userAccessibility", userData.preferredAccessibility ? "true" : "false");
        localStorage.setItem("userSavedStations", JSON.stringify(userData.savedStations || []));

        // Fire storage event or custom event for navbar sync
        window.dispatchEvent(new Event("userAuthChange"));

        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          // If came from a specific page, return there, else go to /stations
          const redirectPath = location.state?.from || "/stations";
          navigate(redirectPath);
        }, 600);
      } else {
        // Registration mode
        const res = await registerUser({
          name,
          email,
          password,
          phone,
          preferredAccessibility,
        });
        const userData = res.data.user;

        localStorage.setItem("isUserLoggedIn", "true");
        localStorage.setItem("userId", userData.id);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userPhone", userData.phone || "");
        localStorage.setItem("userAccessibility", userData.preferredAccessibility ? "true" : "false");
        localStorage.setItem("userSavedStations", JSON.stringify(userData.savedStations || []));

        window.dispatchEvent(new Event("userAuthChange"));

        setSuccess("Registration complete! Welcome to NaviGo.");
        setTimeout(() => {
          navigate("/stations");
        }, 800);
      }
    } catch (err) {
      const msg = err.response?.data?.message || (mode === "login" ? "Login failed. Please check credentials." : "Registration failed.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page-container">
      <div className="auth-card-wrapper">
        {/* Header Icon & Brand */}
        <div className="auth-header-section">
          <div className="auth-icon-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2>{mode === "login" ? "Passenger Sign In" : "Create Passenger Account"}</h2>
          <p className="auth-subtitle">
            {mode === "login"
              ? "Access your saved stations, accessible route preferences, and indoor railway navigation."
              : "Join NaviGo for personalized station accessibility, saved routes, and live Tamil Nadu station guidance."}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Create Account */}
        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="auth-alert error-alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="auth-alert success-alert">
            <span className="alert-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form className="auth-form-card" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group-item">
              <label htmlFor="user-fullname">Full Name *</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="user-fullname"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group-item">
            <label htmlFor="user-email">Email Address *</label>
            <div className="input-with-icon">
              <span className="input-icon">✉️</span>
              <input
                id="user-email"
                type="email"
                placeholder="passenger@navigo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="form-group-item">
              <label htmlFor="user-phone">Mobile Number (Optional)</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  id="user-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group-item">
            <div className="label-row-flex">
              <label htmlFor="user-password">Password *</label>
              {mode === "login" && (
                <button
                  type="button"
                  className="quick-demo-link"
                  onClick={handleQuickDemo}
                  title="Click to auto-fill sample test credentials"
                >
                  ⚡ Auto-Fill Demo
                </button>
              )}
            </div>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="user-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          {/* Accessibility Option for Registration */}
          {mode === "register" && (
            <div className="accessibility-checkbox-card">
              <label className="checkbox-label-styled">
                <input
                  type="checkbox"
                  checked={preferredAccessibility}
                  onChange={(e) => setPreferredAccessibility(e.target.checked)}
                />
                <div className="checkbox-text-group">
                  <span className="checkbox-title">♿ Default to Wheelchair & Step-Free Routes</span>
                  <span className="checkbox-desc">
                    Automatically avoid stairs and prioritize ramps, elevators, and wide corridors across all 26 Tamil Nadu stations.
                  </span>
                </div>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner-text">
                <span className="spinner-dots"></span> Processing...
              </span>
            ) : mode === "login" ? (
              "Sign In to NaviGo"
            ) : (
              "Create My Account"
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Box */}
        <div className="demo-credentials-helper">
          <div className="demo-badge-title">💡 Test / Evaluation Passenger Credentials:</div>
          <div className="demo-creds-row">
            <span>Email: <code>passenger@navigo.com</code></span>
            <span>Password: <code>user123</code></span>
            <button
              type="button"
              className="quick-demo-btn-pill"
              onClick={handleQuickDemo}
            >
              Use These
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="auth-footer-links">
          <div className="auth-switch-link">
            {mode === "login" ? (
              <>
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  className="inline-text-button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  Create one here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="inline-text-button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Sign In instead
                </button>
              </>
            )}
          </div>

          <div className="admin-portal-switch">
            <span>Station Manager or Staff? </span>
            <Link to="/admin/login" className="admin-login-link-subtle">
              Admin Portal Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
