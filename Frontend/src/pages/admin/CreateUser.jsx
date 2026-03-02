import { useState } from "react";
import { adminAPI } from "../../services/api";
import { Card, PageHeader, Btn, Input, Select, Alert } from "../../components/common";
import { UserPlus, CheckCircle } from "lucide-react";

export default function CreateUser() {
  const [form,   setForm]   = useState({ name:"", email:"", password:"", role:"fresher", department:"", manager_id:"" });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState({ type:"", text:"" });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type:"", text:"" });
    try {
      const res = await adminAPI.createUser({ ...form, manager_id: form.manager_id || null });
      setMsg({ type:"success", text:`User "${res.data.name}" created successfully!` });
      setForm({ name:"", email:"", password:"", role:"fresher", department:"", manager_id:"" });
    } catch (err) {
      setMsg({ type:"error", text: err.response?.data?.error || "Failed to create user" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create User" subtitle="Add a new Fresher, Manager or Admin to the platform" />

      <div className="max-w-lg">
        {msg.text && <div className="mb-4"><Alert type={msg.type} message={msg.text} /></div>}

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <Input label="Full Name *"     value={form.name}       onChange={set("name")}     required placeholder="John Doe" />
            <Input label="Email *"         value={form.email}      onChange={set("email")}    required type="email" placeholder="john@company.com" />
            <Input label="Password *"      value={form.password}   onChange={set("password")} required type="password" placeholder="Secure password" />

            <Select label="Role *" value={form.role} onChange={set("role")}>
              <option value="fresher">Fresher</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>

            <Input label="Department"      value={form.department} onChange={set("department")} placeholder="Engineering, DevOps, QA…" />
            <Input label="Manager ID"      value={form.manager_id} onChange={set("manager_id")} type="number"
              placeholder="Manager's user ID (required for freshers)" />

            <div className="pt-1">
              <Btn type="submit" disabled={saving} icon={UserPlus} className="w-full">
                {saving ? "Creating User…" : "Create User"}
              </Btn>
            </div>
          </form>
        </Card>

        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note</p>
          <p className="text-xs text-slate-500">• Freshers need a Manager ID to be linked to their manager</p>
          <p className="text-xs text-slate-500">• Users receive daily summary emails from the backend cron job</p>
          <p className="text-xs text-slate-500">• Review sessions are auto-scheduled on weekends when all tasks are done</p>
        </div>
      </div>
    </div>
  );
}
