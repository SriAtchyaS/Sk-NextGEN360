import { useState } from "react";
import { mockTestAPI, aiAPI } from "../../services/api";
import { Card, PageHeader, Btn, Input, Select, Alert } from "../../components/common";
import { Plus, Trash2, Brain, Sparkles, CheckCircle } from "lucide-react";

const BLANK_Q = {
  question:"", optionA:"", optionB:"", optionC:"", optionD:"", correctAnswer:"A"
};
const OPTS = ["A","B","C","D"];

export default function CreateTest() {
  const [topic,    setTopic]    = useState("");
  const [questions, setQuestions] = useState([{ ...BLANK_Q }]);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const [testId,   setTestId]   = useState(null);

  // AI generation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic,   setAiTopic]  = useState("");

  // Update a question field
  const updateQ = (idx, field, val) =>
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val } : q));

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions(prev => [...prev, { ...BLANK_Q }]);
  };

  const removeQuestion = (idx) =>
    setQuestions(prev => prev.filter((_, i) => i !== idx));

  // Generate questions via Gemini AI
  const generateWithAI = async () => {
    if (!aiTopic.trim()) return setError("Enter a topic to generate questions");
    setAiLoading(true); setError("");
    try {
      const needed = 20 - questions.filter(q => q.question.trim()).length;
      const prompt = `Generate ${needed} multiple choice questions about "${aiTopic}" for a tech fresher onboarding test.
Return ONLY a JSON array with this exact format, no markdown:
[{"question":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A"},...]`;

      // POST /api/ai/ask
      const { data } = await aiAPI.ask(prompt);
      const clean  = data.reply.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const generated = parsed.slice(0, needed).map(q => ({
        question:      q.question      || "",
        optionA:       q.optionA       || "",
        optionB:       q.optionB       || "",
        optionC:       q.optionC       || "",
        optionD:       q.optionD       || "",
        correctAnswer: q.correctAnswer || "A",
      }));

      // Merge with existing non-empty questions
      const existing  = questions.filter(q => q.question.trim());
      const combined  = [...existing, ...generated].slice(0, 20);
      const padded    = [
        ...combined,
        ...Array(Math.max(0, 20 - combined.length)).fill({ ...BLANK_Q })
      ];
      setQuestions(padded);
    } catch (e) {
      setError("AI generation failed. Try again or fill manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = questions.filter(q => q.question.trim() && q.optionA && q.optionB && q.optionC && q.optionD);
    if (valid.length !== 20)
      return setError(`Need exactly 20 complete questions. Currently have ${valid.length}.`);

    setSaving(true); setError(""); setSuccess("");
    try {
      // POST /api/mock-test/create  body: { topic, questions[20] }
      const { data } = await mockTestAPI.create({ topic, questions: valid });
      setTestId(data.testId);
      setSuccess(`✅ Mock Test created! Test ID: ${data.testId} — Share this with your freshers.`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create test");
    } finally {
      setSaving(false);
    }
  };

  const filled = questions.filter(q => q.question.trim()).length;

  return (
    <div>
      <PageHeader
        title="Create Mock Test"
        subtitle={`Build a 20-question test · ${filled}/20 questions filled`}
      />

      {testId && (
        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
          <CheckCircle size={28} className="text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-emerald-800">Test Created Successfully!</p>
            <p className="text-sm text-emerald-600 mt-0.5">
              Share <strong>Test ID: {testId}</strong> with your freshers
            </p>
          </div>
        </div>
      )}

      {error   && <div className="mb-4"><Alert type="error"   message={error}   /></div>}
      {success && !testId && <div className="mb-4"><Alert type="success" message={success} /></div>}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Topic + AI Generator */}
        <Card>
          <div className="p-6 space-y-4">
            <Input
              label="Test Topic *"
              value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. React Fundamentals, Node.js, PostgreSQL…"
              required
            />

            {/* AI Generator */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-indigo-500" />
                <p className="text-sm font-bold text-indigo-700">Generate Questions with Gemini AI</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={aiTopic} onChange={e => setAiTopic(e.target.value)}
                  placeholder="Topic to generate questions about…"
                  className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <Btn type="button" onClick={generateWithAI} disabled={aiLoading}
                  icon={aiLoading ? undefined : Brain}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap">
                  {aiLoading ? "Generating…" : "Auto Fill"}
                </Btn>
              </div>
              <p className="text-xs text-indigo-400 mt-2">
                AI will generate up to {20 - questions.filter(q=>q.question.trim()).length} questions
              </p>
            </div>
          </div>
        </Card>

        {/* Questions */}
        {questions.map((q, idx) => (
          <Card key={idx} title={`Question ${idx + 1}`}
            action={
              questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(idx)}
                  className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )
            }>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Question *</label>
                <textarea
                  rows={2} required value={q.question}
                  onChange={e => updateQ(idx, "question", e.target.value)}
                  placeholder="Enter question text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["A","B","C","D"].map(opt => (
                  <div key={opt} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                      {opt}
                    </span>
                    <input
                      required value={q[`option${opt}`]}
                      onChange={e => updateQ(idx, `option${opt}`, e.target.value)}
                      placeholder={`Option ${opt}`}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              <Select label="Correct Answer"
                value={q.correctAnswer}
                onChange={e => updateQ(idx, "correctAnswer", e.target.value)}>
                {OPTS.map(o => <option key={o} value={o}>Option {o}</option>)}
              </Select>
            </div>
          </Card>
        ))}

        {/* Add + Submit */}
        <div className="flex gap-3">
          {questions.length < 20 && (
            <Btn type="button" variant="outline" icon={Plus} onClick={addQuestion} className="flex-1">
              Add Question ({questions.length}/20)
            </Btn>
          )}
          <Btn type="submit" disabled={saving || filled < 20} className="flex-1">
            {saving ? "Creating Test…" : `Create Test (${filled}/20 filled)`}
          </Btn>
        </div>
      </form>
    </div>
  );
}
