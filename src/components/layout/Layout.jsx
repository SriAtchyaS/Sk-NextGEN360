import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, BookOpen, Brain,
  LogOut, Bell, ChevronDown, Menu, X,
  Zap, Shield, UserCheck, CheckSquare,
  Flame, Send, Plus
} from "lucide-react";
import { aiAPI } from "../../services/api";

// ─── Role Config ──────────────────────────────────────────────────
const NAV = {
  admin: [
    { label: "Dashboard",   icon: LayoutDashboard, to: "/admin" },
    { label: "Users",       icon: Users,           to: "/admin/users" },
    { label: "Create User", icon: UserCheck,       to: "/admin/create-user" },
  ],
  manager: [
    { label: "Dashboard",      icon: LayoutDashboard, to: "/manager" },
    { label: "Add Question",   icon: BookOpen,        to: "/manager/add-question" },
    { label: "Create Test",    icon: Brain,           to: "/manager/create-test" },
  ],
  fresher: [
    { label: "Dashboard",  icon: LayoutDashboard, to: "/fresher" },
    { label: "My Tasks",   icon: CheckSquare,     to: "/fresher/tasks" },
    { label: "Mock Test",  icon: Brain,           to: "/fresher/mock-test" },
  ],
};

const ROLE_STYLE = {
  admin:   "bg-red-500/20     text-red-300",
  manager: "bg-amber-500/20   text-amber-300",
  fresher: "bg-emerald-500/20 text-emerald-300",
};
const ROLE_ICON = { admin: Shield, manager: UserCheck, fresher: Zap };

// ─── AI Floating Assistant (Portal — always fixed to viewport) ────
function AIAssistant({ role }) {
  // Only show for fresher role
  if (role !== "fresher") return null;

  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "ai", text: "Hi! 👋 I'm your Gemini AI assistant. Ask me anything about your topics or mock tests!" }
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMsgs(m => [...m, { from: "user", text }]);
    setLoading(true);
    try {
      const { data } = await aiAPI.ask(text);
      setMsgs(m => [...m, { from: "ai", text: data.reply }]);
    } catch {
      setMsgs(m => [...m, { from: "ai", text: "Sorry, couldn't reach Gemini right now. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Render via portal directly onto document.body ──
  // This means position:fixed is relative to the VIEWPORT, not any scroll container
  return createPortal(
    <>
      {/* Chat Window */}
      {open && (
        <div
          style={{
            position:    "fixed",
            bottom:      "88px",
            right:       "24px",
            width:       "320px",
            zIndex:      9999,
            background:  "#ffffff",
            borderRadius:"20px",
            overflow:    "hidden",
            boxShadow:   "0 20px 60px rgba(0,0,0,0.18)",
            border:      "1px solid rgba(99,102,241,0.15)",
          }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}
            className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-tight">Gemini AI Assistant</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-indigo-200 text-xs">Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3" style={{ background: "#f8fafc" }}>
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                {m.from === "ai" && (
                  <div className="w-6 h-6 rounded-lg flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                    <Flame size={11} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${
                  m.from === "user"
                    ? "text-white rounded-br-sm"
                    : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                }`}
                  style={m.from === "user" ? { background: "#6366f1" } : {}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                  <Flame size={11} className="text-white" />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything…"
              className="flex-1 text-sm px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
              style={{ background: "#6366f1" }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Trigger Button — always stays at fixed bottom-right of viewport */}
      <button
        onClick={() => setOpen(o => !o)}
        title="AI Learning Assistant"
        style={{
          position:     "fixed",
          bottom:       "24px",
          right:        "24px",
          width:        "56px",
          height:       "56px",
          borderRadius: "16px",
          background:   "linear-gradient(135deg,#6366f1,#7c3aed)",
          boxShadow:    "0 8px 32px rgba(99,102,241,0.5)",
          zIndex:       9999,
          border:       "none",
          cursor:       "pointer",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          transition:   "transform 0.15s ease",
          color:        "white",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? <X size={22} /> : <Flame size={22} />}
        {!open && (
          <span style={{
            position:    "absolute",
            top:         "-4px",
            right:       "-4px",
            width:       "14px",
            height:      "14px",
            background:  "#34d399",
            borderRadius:"50%",
            border:      "2px solid white",
          }} />
        )}
      </button>
    </>,
    document.body   // ← renders outside ALL scroll containers — truly fixed to viewport
  );
}

// ─── Sidebar Inner ────────────────────────────────────────────────
function SidebarInner({ user, collapsed, onLogout }) {
  const navItems = NAV[user?.role] || [];
  const RoleIcon = ROLE_ICON[user?.role] || Zap;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
          <span className="text-white font-black text-sm">SK</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-bold text-sm leading-tight">NextGen 360</p>
            <p className="text-slate-500 text-xs">Onboarding Platform</p>
          </div>
        )}
      </div>

      {/* Role chip */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold w-fit ${ROLE_STYLE[user?.role]}`}>
            <RoleIcon size={11} />
            {user?.role?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split("/").length === 2}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
               ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"}`
            }>
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all w-full">
          <LogOut size={17} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/5 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}
        style={{ backgroundColor: "#0f172a" }}>
        <SidebarInner user={user} collapsed={collapsed} onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col" style={{ backgroundColor: "#0f172a" }}>
            <SidebarInner user={user} collapsed={false} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>
            <button
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 text-slate-400"
              onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <Menu size={18} /> : <X size={16} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected to backend
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-50">
                    <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <p className="text-xs text-indigo-500 capitalize font-semibold mt-0.5">{user?.role}</p>
                    {user?.id && (
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: #{user.id}</p>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content — this scrolls, but the AI button is outside via portal */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 animate-slide-up">
            {children}
          </div>
        </main>
      </div>

      {/* AI Assistant — rendered via portal onto document.body
          This means it is ALWAYS fixed to the viewport corner, never affected by scroll */}
      <AIAssistant role={user?.role} />
    </div>
  );
}
