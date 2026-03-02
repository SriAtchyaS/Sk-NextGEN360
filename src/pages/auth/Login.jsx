import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { Alert } from "../../components/common";

const ROLE_REDIRECT = { admin: "/admin", manager: "/manager", fresher: "/fresher" };

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form);
    if (res.success) {
      navigate(ROLE_REDIRECT[res.role] || "/");
    } else {
      setError(res.message);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ background:"rgba(99,102,241,0.1)", filter:"blur(80px)" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" />
        <div style={{ background:"rgba(139,92,246,0.1)", filter:"blur(80px)" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-2xl shadow-indigo-500/40 mb-4">
            <span className="text-white font-black text-xl">SK</span>
          </div>
          <h1 className="text-2xl font-bold text-white">NextGen 360</h1>
          <p className="text-slate-400 text-sm mt-1">Fresher Onboarding & Learning Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 shadow-2xl"
          style={{ background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.1)" }}>

          <h2 className="text-lg font-bold text-white mb-6">Sign in to your account</h2>

          <Alert type="error" message={error} />

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email" required value={form.email} onChange={set("email")}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} required
                  value={form.password} onChange={set("password")}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all mt-2 disabled:opacity-60"
              style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 24px rgba(99,102,241,0.35)" }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-xs text-slate-500 text-center">
              Contact your Admin to get access credentials
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2025 SK Technologies · All rights reserved
        </p>
      </div>
    </div>
  );
}
