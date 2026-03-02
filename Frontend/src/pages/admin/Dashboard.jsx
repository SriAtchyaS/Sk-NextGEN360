import { useEffect, useState } from "react";
import { Users, Brain, Activity, TrendingUp, Plus, Search, Edit2, Trash2 } from "lucide-react";
import {
  StatCard, Card, Btn, PageHeader, Avatar, Badge, Spinner, Alert, Modal, Input, Select
} from "../../components/common";
import { adminAPI } from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

const PIE_COLORS = { admin: "#6366f1", manager: "#10b981", fresher: "#f59e0b" };
const ROLE_COLOR  = { admin: "rose",    manager: "indigo",  fresher: "emerald" };

export default function AdminDashboard() {
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);

  // Create user form
  const [form, setForm]      = useState({ name:"", email:"", password:"", role:"fresher", department:"", manager_id:"" });
  const [saving, setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, usersRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
      ]);
      setStats(dashRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg("");
    try {
      await adminAPI.createUser({
        ...form,
        manager_id: form.manager_id || null,
      });
      setSaveMsg("✅ User created successfully!");
      setForm({ name:"", email:"", password:"", role:"fresher", department:"", manager_id:"" });
      fetchAll();
      setTimeout(() => { setShowModal(false); setSaveMsg(""); }, 1500);
    } catch (e) {
      setSaveMsg("❌ " + (e.response?.data?.error || "Failed to create user"));
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Pie data from API
  const pieData = stats?.usersByRole?.map(r => ({
    name: r.role, value: parseInt(r.count),
    color: PIE_COLORS[r.role] || "#6366f1"
  })) || [];

  // Dept bar data
  const barData = stats?.departmentPerformance?.map(d => ({
    name: d.department,
    avg:  Math.round(parseFloat(d.avg_score) || 0)
  })) || [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Admin Control Center"
        subtitle="Platform overview & user management"
        action={<Btn icon={Plus} onClick={() => setShowModal(true)}>Create User</Btn>}
      />

      <Alert type="error" message={error} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users"          value={users.length}                    icon={Users}     color="indigo" />
        <StatCard label="Total Simulations"    value={stats?.totalSimulations || 0}    icon={Activity}  color="emerald" />
        <StatCard label="AI Interactions"      value={stats?.totalAIInteractions || 0} icon={Brain}     color="amber" />
        <StatCard label="Departments"          value={barData.length}                  icon={TrendingUp} color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2">
          <Card title="Department Avg Score">
            <div className="h-56 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fontSize:12, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius:"12px", border:"none", boxShadow:"0 8px 24px rgba(0,0,0,0.08)" }} />
                  <Bar dataKey="avg" fill="#6366f1" radius={[6,6,0,0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        <Card title="Users by Role">
          <div className="p-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-600 font-medium capitalize">{p.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* User Table */}
      <Card title="All Users" action={
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-8 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:bg-slate-200 w-44 transition-all" />
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {["User","Role","Department","Manager ID",""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge label={u.role} color={ROLE_COLOR[u.role]} /></td>
                  <td className="px-5 py-3 text-sm text-slate-600">{u.department || "—"}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{u.manager_id || "—"}</td>
                  <td className="px-5 py-3">
                    <button className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-slate-400">
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
          Showing {filtered.length} of {users.length} users
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New User">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Full Name"   value={form.name}       onChange={set("name")}       placeholder="John Doe"       required />
          <Input label="Email"       value={form.email}      onChange={set("email")}      type="email" placeholder="john@company.com" required />
          <Input label="Password"    value={form.password}   onChange={set("password")}   type="password" placeholder="••••••••"      required />
          <Select label="Role" value={form.role} onChange={set("role")}>
            <option value="fresher">Fresher</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
          <Input label="Department"  value={form.department} onChange={set("department")} placeholder="Engineering"     />
          <Input label="Manager ID (if Fresher)" value={form.manager_id} onChange={set("manager_id")} placeholder="Manager user ID" type="number" />

          {saveMsg && <Alert type={saveMsg.startsWith("✅") ? "success" : "error"} message={saveMsg} />}

          <div className="flex gap-3 pt-2">
            <Btn variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Btn>
            <Btn type="submit" disabled={saving} className="flex-1">
              {saving ? "Creating…" : "Create User"}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
