// ─────────────────────────────────────────────────────────────────
//  SK NextGen 360 — Reusable UI Components
// ─────────────────────────────────────────────────────────────────

export function StatCard({ label, value, sub, icon: Icon, color = "indigo", trend }) {
  const palette = {
    indigo:  "from-indigo-500  to-indigo-600  shadow-indigo-100",
    violet:  "from-violet-500  to-violet-600  shadow-violet-100",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-100",
    amber:   "from-amber-500   to-amber-600   shadow-amber-100",
    rose:    "from-rose-500    to-rose-600    shadow-rose-100",
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg transition-all duration-200"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.04)" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub  && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-semibold mt-1 ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${palette[color]} flex items-center justify-center shadow-lg`}>
            <Icon size={20} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, label, color = "indigo", showPercent = true }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const bars = { indigo: "bg-indigo-500", emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500" };
  return (
    <div className="space-y-1.5">
      {(label || showPercent) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
          {showPercent && <span className="text-sm font-bold text-slate-500">{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${bars[color]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Badge({ label, color = "slate" }) {
  const c = {
    slate:   "bg-slate-100  text-slate-600",
    indigo:  "bg-indigo-50  text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber:   "bg-amber-50   text-amber-700",
    rose:    "bg-rose-50    text-rose-700",
    violet:  "bg-violet-50  text-violet-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c[color]}`}>
      {label}
    </span>
  );
}

export function Card({ children, className = "", title, action }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.04)" }}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          {title  && <h3 className="font-bold text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Btn({ children, onClick, type = "button", variant = "primary", size = "md", icon: Icon, disabled, className = "" }) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger:   "bg-red-600 hover:bg-red-700 text-white",
    ghost:    "hover:bg-slate-100 text-slate-600",
    outline:  "border border-slate-200 hover:bg-slate-50 text-slate-700",
    success:  "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === "lg" ? 18 : 14} />}
      {children}
    </button>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function Avatar({ name = "?", size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  const gcs   = ["from-indigo-500 to-violet-600","from-emerald-500 to-teal-600","from-amber-500 to-orange-600","from-rose-500 to-pink-600"];
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br ${gcs[(name.charCodeAt(0)||0)%4]} flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export function Spinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return <div className={`${s[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />;
}

export function ReadinessChip({ level }) {
  const map = {
    "Not Ready":    { c: "bg-rose-50    text-rose-700",    d: "bg-rose-500"    },
    "In Progress":  { c: "bg-amber-50   text-amber-700",   d: "bg-amber-500"   },
    "Almost Ready": { c: "bg-blue-50    text-blue-700",    d: "bg-blue-500"    },
    "Ready":        { c: "bg-emerald-50 text-emerald-700", d: "bg-emerald-500" },
  };
  const s = map[level] || map["In Progress"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.c}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.d}`} />{level}
    </span>
  );
}

export function Alert({ type = "error", message }) {
  if (!message) return null;
  const styles = {
    error:   "bg-red-50   border-red-200   text-red-700",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700",
    info:    "bg-indigo-50 border-indigo-200 text-indigo-700",
  };
  return (
    <div className={`px-4 py-3 rounded-xl border text-sm font-medium ${styles[type]}`}>
      {message}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
          ${error ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>}
      <select
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...props}>
        {children}
      </select>
    </div>
  );
}
