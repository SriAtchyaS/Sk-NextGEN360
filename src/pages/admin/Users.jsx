import { useEffect, useState } from "react";
import { adminAPI } from "../../services/api";
import { PageHeader, Card, Avatar, Badge, Spinner, Alert, Btn, Modal, Input, Select } from "../../components/common";
import { Plus, Search } from "lucide-react";

const ROLE_COLOR = { admin: "rose", manager: "indigo", fresher: "emerald" };

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form,    setForm]    = useState({ name:"", email:"", password:"", role:"fresher", department:"", manager_id:"" });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      await adminAPI.createUser({ ...form, manager_id: form.manager_id || null });
      setMsg("✅ User created!");
      fetchUsers();
      setTimeout(() => { setShowModal(false); setMsg(""); setForm({ name:"",email:"",password:"",role:"fresher",department:"",manager_id:"" }); }, 1500);
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Error"));
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="User Management" subtitle="All platform users"
        action={<Btn icon={Plus} onClick={() => setShowModal(true)}>Add User</Btn>} />

      <Alert type="error" message={error} />

      <Card title="Users" action={
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="pl-8 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none w-48" />
        </div>
      }>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  {["#","User","Role","Department","Manager ID"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400">{i + 1}</td>
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
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-sm text-slate-400">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name"       value={form.name}       onChange={set("name")}       required placeholder="Full name" />
          <Input label="Email"      value={form.email}      onChange={set("email")}      required type="email" placeholder="email@company.com" />
          <Input label="Password"   value={form.password}   onChange={set("password")}   required type="password" placeholder="••••••••" />
          <Select label="Role"      value={form.role}       onChange={set("role")}>
            <option value="fresher">Fresher</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
          <Input label="Department" value={form.department} onChange={set("department")} placeholder="Engineering" />
          <Input label="Manager ID" value={form.manager_id} onChange={set("manager_id")} type="number" placeholder="Manager's user ID (for freshers)" />
          {msg && <Alert type={msg.startsWith("✅") ? "success" : "error"} message={msg} />}
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Btn>
            <Btn type="submit" disabled={saving} className="flex-1">{saving ? "Saving…" : "Create"}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
