import { useState, useEffect } from "react";
import {
  BookOpen, Brain, Users, ChevronRight,
  CheckCircle2, Clock, TrendingUp, RefreshCw, Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  StatCard, Card, Btn, PageHeader, Avatar,
  ProgressBar, ReadinessChip, Spinner, Alert
} from "../../components/common";
import { managerAPI } from "../../services/api";

// ─── Fresher Row ──────────────────────────────────────────
function FresherRow({ fresher }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
      <Avatar name={fresher.name} size="lg" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-slate-800">{fresher.name}</p>
          <ReadinessChip level="In Progress" />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{fresher.email}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {fresher.department && (
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-medium">
              {fresher.department}
            </span>
          )}
          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg font-medium">
            Fresher #{fresher.id}
          </span>
        </div>
      </div>

      {/* Progress — tasks not returned by /admin/users endpoint yet */}
      <div className="w-36 hidden sm:block flex-shrink-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-slate-500 font-semibold">—</span>
        </div>
        <ProgressBar value={0} max={100} color="indigo" showPercent={false} />
        <p className="text-xs text-slate-400 mt-1">Tasks not yet loaded</p>
      </div>

      <div className="text-center hidden md:block flex-shrink-0 w-20">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mgr ID</p>
        <p className="text-sm font-bold text-indigo-600 mt-0.5">{fresher.manager_id}</p>
      </div>
    </div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────
export default function ManagerDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [allUsers,  setAllUsers]  = useState([]);
  const [freshers,  setFreshers]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  useEffect(() => { fetchFreshers(); }, []);

  const fetchFreshers = async () => {
    setLoading(true); setError("");
    try {
      // GET /api/admin/users → [{ id, name, email, role, department, manager_id }]
      const { data } = await adminAPI.getAllUsers();
      setAllUsers(data);

      // user.id is decoded from JWT in AuthContext (numeric DB id)
      // manager_id in DB is integer — use == to safely compare even if one is string
      const managerId = user?.id;
      // eslint-disable-next-line eqeqeq
      const myFreshers = data.filter(u => u.role === "fresher" && u.manager_id == managerId);
      setFreshers(myFreshers);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const totalFreshers = freshers.length;

  const ACTIONS = [
    { title: "Add Question",    desc: "Add MCQ to the question bank for freshers",    icon: BookOpen, color: "indigo", to: "/manager/add-question" },
    { title: "Create Mock Test", desc: "Build a 20-question AI-powered mock test",    icon: Brain,    color: "violet", to: "/manager/create-test"  },
  ];

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "Manager"} 👋`}
        subtitle="Manage your freshers, questions and tests"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Freshers"  value={totalFreshers}        icon={Users}        color="indigo" />
        <StatCard label="Your ID"      value={`#${user?.id ?? "?"}`} icon={CheckCircle2} color="emerald" sub="Share with Admin" />
        <StatCard label="In Progress"  value={totalFreshers}        icon={Clock}        color="amber"  />
        <StatCard label="Total Users"  value={allUsers.length}      icon={TrendingUp}   color="violet" />
      </div>

      {/* Freshers table */}
      <Card
        title="Freshers Assigned to Me"
        className="mb-6"
        action={
          <Btn variant="ghost" size="sm" icon={RefreshCw} onClick={fetchFreshers}>
            Refresh
          </Btn>
        }
      >
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>

        ) : error ? (
          <div className="p-5"><Alert type="error" message={error} /></div>

        ) : freshers.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="text-5xl mb-3">👥</div>
            <p className="font-bold text-slate-700 text-base">No freshers assigned to you yet</p>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-sm mx-auto">
              Ask your Admin to create fresher accounts with{" "}
              <strong className="text-slate-600">Manager ID = {user?.id ?? "?"}</strong>
            </p>

            {/* Helper badge */}
            <div className="mt-5 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-5 py-2.5 rounded-2xl text-sm font-semibold">
              <Info size={16} />
              Your Manager ID is&nbsp;<span className="text-xl font-black">#{user?.id ?? "?"}</span>
            </div>

            {/* Debug — helps verify the filter is working */}
            <div className="mt-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono inline-block">
              Filtering: role=fresher AND manager_id = {user?.id ?? "null"}
              &nbsp;·&nbsp;Total users in DB: {allUsers.length}
              &nbsp;·&nbsp;Freshers found: {allUsers.filter(u => u.role === "fresher").length}
            </div>
          </div>

        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 mt-2">
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fresher</p>
              </div>
              <div className="w-36">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</p>
              </div>
              <div className="w-20 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mgr ID</p>
              </div>
            </div>
            {freshers.map(f => <FresherRow key={f.id} fresher={f} />)}
            <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
              {totalFreshers} fresher{totalFreshers !== 1 ? "s" : ""} assigned to you
            </div>
          </>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {ACTIONS.map(a => {
          const gcs = { indigo: "from-indigo-500 to-indigo-600", violet: "from-violet-500 to-violet-600" };
          return (
            <button key={a.to} onClick={() => navigate(a.to)}
              className="group bg-white border border-slate-100 rounded-2xl p-6 text-left hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05),0 8px 24px rgba(0,0,0,0.04)" }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gcs[a.color]} flex items-center justify-center shadow-lg`}>
                  <a.icon size={22} className="text-white" />
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-1" />
              </div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">{a.title}</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{a.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Guide */}
      <Card title="Manager Workflow Guide">
        <div className="p-5 space-y-3">
          {[
            { step: "1", text: `Your Manager ID is #${user?.id ?? "?"}. Tell your Admin this when creating fresher accounts` },
            { step: "2", text: "Once freshers are created with your Manager ID, they will appear in the table above" },
            { step: "3", text: "Add MCQ questions to the question bank using 'Add Question'" },
            { step: "4", text: "Create a 20-question mock test and share the Test ID with your freshers" },
            { step: "5", text: "Review requests from freshers arrive via email — they can schedule from their dashboard" },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.step}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
