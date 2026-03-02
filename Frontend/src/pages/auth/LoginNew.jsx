import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { Alert } from "../../components/common";

const ROLE_REDIRECT = { admin: "/admin", manager: "/manager", fresher: "/fresher" };

// Floating Shellkode logos
const FloatingLogo = ({ delay, duration, startX, startY }) => (
  <div
    className="absolute text-6xl font-black opacity-10 pointer-events-none"
    style={{
      left: startX,
      top: startY,
      animation: `float ${duration}s ease-in-out ${delay}s infinite`,
      background: 'linear-gradient(135deg, #6366f1, #ec4899, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 0 40px rgba(139,92,246,0.5)',
    }}
  >
    Shellkode
  </div>
);

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Page load animation
    setTimeout(() => setPageLoaded(true), 100);

    // Add floating animation CSS
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(50px, -50px) rotate(5deg); }
        50% { transform: translate(-30px, -100px) rotate(-5deg); }
        75% { transform: translate(30px, -50px) rotate(3deg); }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

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
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg,#0a0a1f 0%,#1a0a2e 25%,#16003b 50%,#1a0a2e 75%,#0a0a1f 100%)",
        transition: 'all 0.5s ease',
      }}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse 8s ease-in-out infinite"
        }} className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" />
        <div style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "pulse 10s ease-in-out infinite 2s"
        }} className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" />
        <div style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "pulse 12s ease-in-out infinite 4s"
        }} className="absolute top-1/2 right-1/3 w-96 h-96 rounded-full" />
      </div>

      {/* Floating Shellkode logos */}
      <FloatingLogo delay={0} duration={15} startX="10%" startY="10%" />
      <FloatingLogo delay={3} duration={18} startX="80%" startY="15%" />
      <FloatingLogo delay={6} duration={20} startX="15%" startY="70%" />
      <FloatingLogo delay={9} duration={17} startX="75%" startY="75%" />
      <FloatingLogo delay={12} duration={19} startX="50%" startY="5%" />

      <div
        className="relative w-full max-w-md"
        style={{
          opacity: pageLoaded ? 1 : 0,
          transform: pageLoaded ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl mb-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #6366f1 100%)',
              boxShadow: '0 20px 60px rgba(139,92,246,0.6), 0 0 80px rgba(236,72,153,0.4)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          >
            <span className="text-white font-black text-3xl relative z-10">S</span>
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)',
              }}
            />
          </div>
          <h1
            className="text-4xl font-black mb-2"
            style={{
              background: 'linear-gradient(135deg, #a78bfa, #f472b6, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.05em',
            }}
          >
            Shellkode
          </h1>
          <p className="text-slate-400 text-sm mt-2">Fresher Onboarding & Learning Platform</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
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
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                }}
                onFocus={(e) => e.target.style.border = '1px solid rgba(139,92,246,0.5)'}
                onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
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
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid rgba(139,92,246,0.5)'}
                  onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all mt-6 disabled:opacity-60 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#ec4899,#6366f1)",
                boxShadow: "0 10px 30px rgba(139,92,246,0.5), 0 0 40px rgba(236,72,153,0.3)",
              }}>
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
          © 2026 Shellkode · All rights reserved
        </p>
      </div>
    </div>
  );
}
