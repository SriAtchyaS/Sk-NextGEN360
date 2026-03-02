import { useEffect, useState } from "react";
import {
  CheckSquare, Brain, Star, ChevronRight,
  CheckCircle2, Clock, CalendarCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  StatCard, Card, Btn, PageHeader, Badge, ProgressBar,
  Spinner, Alert, ReadinessChip, Modal, Input
} from "../../components/common";
import { fresherAPI, taskAPI, reviewAPI } from "../../services/api";

// ─── Review Schedule Modal ────────────────────────────────────────
function ReviewModal({ open, onClose }) {
  const { user } = useAuth();
  const [form,   setForm]   = useState({ date: "", message: "", managerEmail: "" });
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState({ type: "", text: "" });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg({ type: "", text: "" });
    try {
      await reviewAPI.scheduleReview({
        fresherName:  user?.name,
        managerEmail: form.managerEmail,
        date:         form.date,
        message:      form.message,
      });
      setMsg({ type: "success", text: "✅ Review request sent to your manager!" });
      setForm({ date: "", message: "", managerEmail: "" });
      setTimeout(() => { onClose(); setMsg({ type: "", text: "" }); }, 2000);
    } catch {
      setMsg({ type: "error", text: "Failed to send request. Check manager email and try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Schedule Review with Manager">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700">📅 Request a review session</p>
          <p className="text-xs text-indigo-500 mt-0.5">
            Your manager will receive an email with your preferred date
          </p>
        </div>
        <Input
          label="Manager's Email *"
          type="email"
          value={form.managerEmail}
          onChange={set("managerEmail")}
          placeholder="manager@company.com"
          required
        />
        <Input
          label="Preferred Review Date *"
          type="date"
          value={form.date}
          onChange={set("date")}
          required
          min={new Date().toISOString().split("T")[0]}
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Message (optional)
          </label>
          <textarea
            value={form.message}
            onChange={set("message")}
            rows={3}
            placeholder="Topics you'd like to discuss or areas you need help with…"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        {msg.text && <Alert type={msg.type} message={msg.text} />}
        <div className="flex gap-3 pt-1">
          <Btn variant="outline" onClick={onClose} className="flex-1" type="button">Cancel</Btn>
          <Btn type="submit" disabled={saving} icon={CalendarCheck} className="flex-1">
            {saving ? "Sending…" : "Send Request"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── Fresher Dashboard ────────────────────────────────────────────
export default function FresherDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [tasks,       setTasks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [reviewModal, setReviewModal] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await fresherAPI.getMyTasks();
      setTasks(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await fresherAPI.completeTask(taskId);
      setSuccess("Task marked as completed!");
      fetchTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to complete task");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCalculateScore = async () => {
    try {
      const { data } = await fresherAPI.calculateScore();
      setSuccess(`Score calculated: ${data.totalScore} / 100`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError(e.response?.data?.message || "No completed topic found to score");
      setTimeout(() => setError(""), 3000);
    }
  };

  const completed = tasks.filter(t => t.status === 'completed');
  const pending   = tasks.filter(t => t.status === 'pending');
  const pct       = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;

  const readiness =
    pct === 100 ? "Ready"        :
    pct >= 70   ? "Almost Ready" :
    pct >= 30   ? "In Progress"  : "Not Ready";

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "Fresher"} 👋`}
        subtitle="Track your onboarding progress"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <ReadinessChip level={readiness} />
            <Btn variant="outline" icon={CalendarCheck} onClick={() => setReviewModal(true)}>
              Schedule Review
            </Btn>
            <Btn icon={Brain} onClick={() => navigate("/fresher/mock-test")}>
              Start Mock Test
            </Btn>
          </div>
        }
      />

      {error   && <div className="mb-4"><Alert type="error"   message={error}   /></div>}
      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tasks"  value={tasks.length}     icon={CheckSquare}  color="indigo"  />
        <StatCard label="Completed"    value={completed.length} icon={CheckCircle2} color="emerald" />
        <StatCard label="Pending"      value={pending.length}   icon={Clock}        color="amber"   />
        <StatCard label="Progress"     value={`${pct}%`}        icon={Star}         color="violet"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Tasks List */}
        <div className="lg:col-span-2">
          <Card
            title="My Assigned Tasks"
            action={<Btn variant="ghost" size="sm" onClick={handleCalculateScore}>Calculate Score</Btn>}
          >
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : tasks.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm font-semibold text-slate-600">No tasks assigned yet</p>
                <p className="text-xs text-slate-400 mt-1">Your manager will assign tasks soon</p>
              </div>
            ) : (
              <div className="px-5 pb-2">
                {tasks.map(task => (
                  <div key={task.id}
                    onClick={() => navigate("/fresher/tasks")}
                    className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 rounded-lg px-3 -mx-3 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${task.status === 'completed' ? "bg-emerald-50" : "bg-amber-50"}`}>
                      {task.status === 'completed'
                        ? <CheckCircle2 size={16} className="text-emerald-500" />
                        : <Clock        size={16} className="text-amber-500"   />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {task.topic || `Task #${task.id}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Assigned by: {task.manager_name}
                      </p>
                      {task.subtopics && task.subtopics.length > 0 && (
                        <p className="text-xs text-indigo-500 mt-0.5">{task.subtopics.length} subtopics</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge label={task.status === 'completed' ? "Completed" : "Pending"}
                        color={task.status === 'completed' ? "emerald" : "amber"} />
                      {task.status === 'pending' && (
                        <Btn size="sm" variant="success" onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(task.id);
                        }}>
                          Complete
                        </Btn>
                      )}
                      {task.status === 'completed' && !task.mock_test_completed && (
                        <Btn size="sm" variant="primary" onClick={(e) => {
                          e.stopPropagation();
                          navigate("/fresher/mock-test");
                        }}>
                          Test
                        </Btn>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-5">

          {/* Progress */}
          <Card title="Overall Progress">
            <div className="p-5 space-y-4">
              <div className="text-center mb-2">
                <p className="text-4xl font-black text-slate-900">
                  {pct}<span className="text-xl text-slate-400">%</span>
                </p>
                <p className="text-sm text-slate-400 mt-0.5">Tasks Completed</p>
                <div className="mt-2"><ReadinessChip level={readiness} /></div>
              </div>
              <ProgressBar value={completed.length} max={tasks.length || 1} color="indigo" label="Completion" />
              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Completed</span>
                  <span className="font-bold text-emerald-600">{completed.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Remaining</span>
                  <span className="font-bold text-amber-600">{pending.length}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Review Session */}
          <Card title="Review Session">
            <div className="p-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <CalendarCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Schedule a Review</p>
                    <p className="text-xs text-slate-500">Meet with your manager</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Request a session when you've completed tasks and want feedback.
                </p>
                <Btn icon={CalendarCheck} className="w-full" onClick={() => setReviewModal(true)}>
                  Request Review
                </Btn>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="p-4 space-y-2">
              <button onClick={() => navigate("/fresher/mock-test")}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Brain size={16} className="text-indigo-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Start Mock Test</span>
                <ChevronRight size={14} className="text-slate-300 ml-auto" />
              </button>
              <button onClick={() => navigate("/fresher/tasks")}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckSquare size={16} className="text-emerald-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700">View All Tasks</span>
                <ChevronRight size={14} className="text-slate-300 ml-auto" />
              </button>
              <button onClick={() => setReviewModal(true)}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/40 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                  <CalendarCheck size={16} className="text-violet-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-violet-700">Schedule Review</span>
                <ChevronRight size={14} className="text-slate-300 ml-auto" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal open={reviewModal} onClose={() => setReviewModal(false)} />

      {/* NOTE: AI Assistant is in Layout.jsx via React Portal — always visible at viewport corner */}
    </div>
  );
}
