import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineShieldCheck, HiOutlineSparkles } from "react-icons/hi";
import { loginApi } from "../utils/api.js";
import { setToken, setUser, isAuthenticated } from "../utils/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeRole, setActiveRole] = useState("admin"); // 'admin' | 'caller'
  const [username, setUsername] = useState("ShikshaCRM");
  const [password, setPassword] = useState("ShikshaCRM@123");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if session expired
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("expired")) {
      setError("Session expired. Please sign in again.");
    }
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  const handleRoleTabChange = (role) => {
    setActiveRole(role);
    setError("");
    if (role === "admin") {
      setUsername("ShikshaCRM");
      setPassword("ShikshaCRM@123");
    } else {
      setUsername("ShikshaCaller");
      setPassword("ShikshaCaller@123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginApi(username.trim(), password.trim(), activeRole);
      if (res?.success && res?.token) {
        setToken(res.token);
        setUser(res.user);
        navigate("/", { replace: true });
      } else {
        throw new Error(res?.error || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Card */}
        <div className="p-8 pb-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <span className="font-extrabold text-2xl tracking-tighter">S</span>
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Shiksha <span className="text-blue-600">CRM Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Admissions Pipeline & Intelligent Lead Scoring System
          </p>

          {/* Role Switcher Tabs */}
          <div className="mt-6 p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleRoleTabChange("admin")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeRole === "admin"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiOutlineShieldCheck className="w-4 h-4" />
              Administrator
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange("caller")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeRole === "caller"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiOutlineUser className="w-4 h-4" />
              Counselor / Staff
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {activeRole === "admin" ? "Admin Username" : "Staff Username"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <HiOutlineUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <HiOutlineLockClosed className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                "Authenticating Session..."
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  Sign In as {activeRole === "admin" ? "Administrator" : "Counselor"}
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              Secured with timing-safe constant comparison authentication.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
