import { useState } from "react";
import { managerAPI } from "../../services/api";
import { Card, PageHeader, Btn, Input, Select, Alert } from "../../components/common";
import { CheckCircle, Plus } from "lucide-react";

const DEPARTMENTS = ["Engineering", "DevOps", "QA", "Data", "Design", "Management"];
const OPTIONS = ["A", "B", "C", "D"];

const BLANK = {
  department: "Engineering",
  question: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
};

export default function AddQuestion() {
  const [form,    setForm]    = useState(BLANK);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const [count,   setCount]   = useState(0);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(""); setError("");
    try {
      // POST /api/manager/add-question
      await managerAPI.addQuestion(form);
      setCount(c => c + 1);
      setSuccess(`Question #${count + 1} added successfully!`);
      // Keep department, reset rest
      setForm(f => ({ ...BLANK, department: f.department }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add Question"
        subtitle={`Add MCQ questions to the question bank · ${count} added this session`}
      />

      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}
      {error   && <div className="mb-4"><Alert type="error"   message={error}   /></div>}

      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            <Select label="Department" value={form.department} onChange={set("department")}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>

            {/* Question */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Question *
              </label>
              <textarea
                required value={form.question} onChange={set("question")} rows={3}
                placeholder="Enter your question here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["a","b","c","d"].map((opt, i) => (
                <div key={opt} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Option {OPTIONS[i]} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {OPTIONS[i]}
                    </span>
                    <input
                      required value={form[`option_${opt}`]} onChange={set(`option_${opt}`)}
                      placeholder={`Option ${OPTIONS[i]}`}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <Select label="Correct Answer" value={form.correct_option} onChange={set("correct_option")}>
              {OPTIONS.map(o => <option key={o} value={o}>Option {o}</option>)}
            </Select>

            <div className="pt-2 flex gap-3">
              <Btn type="button" variant="outline" onClick={() => setForm(BLANK)} className="flex-1">
                Clear
              </Btn>
              <Btn type="submit" disabled={saving} icon={Plus} className="flex-1">
                {saving ? "Adding…" : "Add Question"}
              </Btn>
            </div>
          </form>
        </Card>

        {count > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">
              {count} question{count > 1 ? "s" : ""} added to the question bank
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
