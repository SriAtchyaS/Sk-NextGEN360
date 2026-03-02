import { useEffect, useState } from "react";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { fresherAPI, taskAPI } from "../../services/api";
import { Card, PageHeader, Btn, Badge, Alert, Spinner, Modal, Input } from "../../components/common";

export default function FresherTasks() {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  // Complete topic modal
  const [completeModal, setCompleteModal] = useState(false);
  const [selectedTask,  setSelectedTask]  = useState(null);
  const [notes,         setNotes]         = useState("");
  const [saving,        setSaving]        = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await fresherAPI.getMyTasks();
      setTasks(data);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  // POST /api/fresher/start-topic
  const handleStart = async (topicId) => {
    try {
      await fresherAPI.startTopic({ topic_id: topicId });
      setSuccess("Timer started! Begin learning now.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to start topic");
      setTimeout(() => setError(""), 3000);
    }
  };

  // POST /api/fresher/complete-topic
  const handleCompleteTopic = async () => {
    setSaving(true);
    try {
      await fresherAPI.completeTopic({ topic_id: selectedTask.topic_id, notes });
      await taskAPI.markComplete(selectedTask.id);
      setSuccess("Topic completed and task marked done!");
      setCompleteModal(false);
      setNotes("");
      fetchTasks();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to complete topic");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Tasks" subtitle="Complete assigned learning tasks" />

      {error   && <div className="mb-4"><Alert type="error"   message={error}   /></div>}
      {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-slate-600">No tasks assigned yet</p>
            <p className="text-sm text-slate-400 mt-1">Your manager will assign tasks soon</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${task.completed ? "bg-emerald-50" : "bg-amber-50"}`}>
                  {task.completed
                    ? <CheckCircle2 size={18} className="text-emerald-500" />
                    : <Clock         size={18} className="text-amber-500"   />
                  }
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {task.title || `Task #${task.id}`}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    {task.topic_id && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-medium">
                        Topic #{task.topic_id}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-slate-400">Due: {task.due_date}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge label={task.completed ? "Completed" : "Pending"}
                    color={task.completed ? "emerald" : "amber"} />

                  {!task.completed && task.topic_id && (
                    <>
                      <Btn size="sm" variant="outline" icon={PlayCircle}
                        onClick={() => handleStart(task.topic_id)}>
                        Start
                      </Btn>
                      <Btn size="sm" variant="success"
                        onClick={() => { setSelectedTask(task); setCompleteModal(true); }}>
                        Complete
                      </Btn>
                    </>
                  )}
                  {!task.completed && !task.topic_id && (
                    <Btn size="sm" variant="success"
                      onClick={() => taskAPI.markComplete(task.id).then(fetchTasks)}>
                      Mark Done
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Complete Topic Modal */}
      <Modal open={completeModal} onClose={() => setCompleteModal(false)} title="Complete Topic">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Add your learning notes before completing <strong>{selectedTask?.title}</strong>
          </p>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Learning Notes (optional)
            </label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="What did you learn from this topic?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => setCompleteModal(false)} className="flex-1">Cancel</Btn>
            <Btn variant="success" onClick={handleCompleteTopic} disabled={saving} className="flex-1">
              {saving ? "Saving…" : "Mark Complete"}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
