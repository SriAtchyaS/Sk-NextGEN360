import { useState } from "react";
import {
  Brain, Clock, CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight, Flame
} from "lucide-react";
import { mockTestAPI, aiAPI } from "../../services/api";
import {
  Card, Btn, PageHeader, ProgressBar, Alert, Spinner, Input
} from "../../components/common";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const PHASES = { ENTER: "enter", TESTING: "testing", RESULT: "result" };

// ─── Phase 1: Enter Test ID ───────────────────────────────────────
function EnterTestId({ onStart }) {
  const [testId,  setTestId]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleStart = async () => {
    if (!testId.trim()) return setError("Please enter a Test ID");
    setLoading(true); setError("");
    try {
      // GET /api/mock-test/start/:testId
      const { data } = await mockTestAPI.start(testId);
      if (!data || data.length === 0)
        return setError("No questions found for this test. Ask your manager.");
      onStart(testId, data);
    } catch (e) {
      setError(e.response?.data?.error || "Test not found. Check the ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <PageHeader title="Mock Test" subtitle="Enter the Test ID provided by your manager" />
      <Card>
        <div className="p-6 space-y-4">
          <Input
            label="Test ID"
            value={testId}
            onChange={e => setTestId(e.target.value)}
            placeholder="e.g. 1, 2, 3 ..."
            type="number"
          />
          {error && <Alert type="error" message={error} />}
          <Btn onClick={handleStart} disabled={loading} className="w-full" icon={Brain}>
            {loading ? "Loading Questions…" : "Start Test"}
          </Btn>
          <p className="text-xs text-slate-400 text-center">
            10 random questions will be selected from the test bank
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Phase 2: Take Test ───────────────────────────────────────────
function TakeTest({ testId, questions, onSubmit }) {
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState({});   // { questionId: "A"|"B"|"C"|"D" }
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const q       = questions[current];
  const total   = questions.length;
  const options = [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d },
  ];

  const select = (key) => {
    setAnswers(prev => ({ ...prev, [q.id]: key }));
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    // POST /api/mock-test/submit
    // body: { testId, answers: [{ questionId, selected }] }
    const payload = Object.entries(answers).map(([qId, selected]) => ({
      questionId: parseInt(qId),
      selected,
    }));
    try {
      const { data } = await mockTestAPI.submit({ testId: parseInt(testId), answers: payload });
      onSubmit(data, answers, questions);
    } catch (e) {
      setError(e.response?.data?.error || "Submission failed");
      setLoading(false);
    }
  };

  const answered = Object.keys(answers).length;
  const selected = answers[q?.id];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mock Test #{testId}</p>
          <h2 className="text-lg font-bold text-slate-900">Question {current + 1} of {total}</h2>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-mono font-bold text-sm">
          <Clock size={14} /> {total} Questions
        </div>
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Progress</span>
          <span>{answered} answered</span>
        </div>
        <ProgressBar value={current + 1} max={total} color="indigo" showPercent={false} />
      </div>

      {/* Question pills */}
      <div className="flex gap-1.5 flex-wrap mb-5">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all
              ${i === current
                ? "bg-indigo-600 text-white"
                : answers[questions[i].id]
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <Card>
        <div className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {current + 1}
            </div>
            <p className="text-base font-semibold text-slate-800 leading-relaxed">{q.question}</p>
          </div>

          <div className="space-y-2.5">
            {options.map(({ key, text }) => {
              if (!text) return null;
              const isSelected = selected === key;
              return (
                <button key={key} onClick={() => select(key)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium border
                    ${isSelected
                      ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                      : "border-slate-100 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40"
                    }`}>
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200"}`}>
                    {key}
                  </span>
                  <span className="flex-1">{text}</span>
                  {isSelected && <CheckCircle size={16} className="text-indigo-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {error && <div className="mt-3"><Alert type="error" message={error} /></div>}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-5">
        <Btn variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
          ← Previous
        </Btn>

        {current < total - 1 ? (
          <Btn onClick={() => setCurrent(c => c + 1)} icon={ChevronRight}>
            Next
          </Btn>
        ) : (
          <Btn onClick={handleSubmit} disabled={loading} icon={Trophy}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 text-sm font-semibold rounded-xl">
            {loading ? "Submitting…" : `Submit Test (${answered}/${total} answered)`}
          </Btn>
        )}
      </div>
    </div>
  );
}

// ─── Phase 3: Result ──────────────────────────────────────────────
function Result({ result, onRetry }) {
  const { score, totalQuestions } = result;
  const pct   = Math.round(score);
  const grade = pct >= 90 ? { label:"Excellent", emoji:"🏆" }
               : pct >= 75 ? { label:"Good",      emoji:"⭐" }
               : pct >= 60 ? { label:"Average",   emoji:"📈" }
               :              { label:"Keep Going", emoji:"💪" };

  const radarData = [
    { subject:"Concepts",    A: pct      },
    { subject:"Speed",       A: 75       },
    { subject:"Accuracy",    A: pct - 5  },
    { subject:"Consistency", A: 80       },
    { subject:"Depth",       A: pct - 10 },
  ];

  // AI feedback state
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);

  const getAIFeedback = async () => {
    setAiLoading(true);
    try {
      // POST /api/ai/ask
      const { data } = await aiAPI.ask(
        `I scored ${pct}% on a mock test with ${totalQuestions} questions. Give me 3 specific tips to improve my score. Keep it concise and encouraging.`
      );
      setAiFeedback(data.reply);
    } catch (e) {
      setAiFeedback("Could not get AI feedback. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Test Results" />

      {/* Score hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-center mb-5 shadow-xl shadow-indigo-500/30">
        <p className="text-5xl mb-3">{grade.emoji}</p>
        <p className="text-7xl font-black text-white mb-2">
          {pct}<span className="text-3xl text-indigo-300">%</span>
        </p>
        <p className="inline-flex px-4 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white mb-5">
          {grade.label}
        </p>
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="text-indigo-200">
            <p className="text-2xl font-black text-white">{Math.round((pct / 100) * totalQuestions)}</p>
            <p>Correct</p>
          </div>
          <div className="w-px h-10 bg-indigo-400/40" />
          <div className="text-indigo-200">
            <p className="text-2xl font-black text-white">{totalQuestions}</p>
            <p>Total</p>
          </div>
          <div className="w-px h-10 bg-indigo-400/40" />
          <div className="text-indigo-200">
            <p className="text-2xl font-black text-white">{pct}%</p>
            <p>Score</p>
          </div>
        </div>
      </div>

      {/* Radar */}
      <Card title="Performance Breakdown" className="mb-5">
        <div className="h-52 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:12, fill:"#94a3b8" }} />
              <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AI Feedback */}
      <Card title="AI-Powered Feedback" className="mb-5">
        <div className="p-5">
          {!aiFeedback ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-3">Get personalised improvement tips from Gemini AI</p>
              <Btn icon={Flame} onClick={getAIFeedback} disabled={aiLoading}>
                {aiLoading ? "Getting AI Tips…" : "Get AI Feedback"}
              </Btn>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">🤖 Gemini AI Tips</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{aiFeedback}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Btn variant="outline" icon={RotateCcw} onClick={onRetry} className="flex-1">Take Another Test</Btn>
      </div>
    </div>
  );
}

// ─── AI Floating Assistant ────────────────────────────────────────
function AIAssistant() {
  const [open,    setOpen]   = useState(false);
  const [msgs,    setMsgs]   = useState([
    { from:"ai", text:"Hi! I'm your AI learning assistant powered by Gemini. Ask me anything about your studies!" }
  ]);
  const [input,   setInput]  = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMsgs(m => [...m, { from:"user", text: userMsg }]);
    setLoading(true);
    try {
      // POST /api/ai/ask
      const { data } = await aiAPI.ask(userMsg);
      setMsgs(m => [...m, { from:"ai", text: data.reply }]);
    } catch {
      setMsgs(m => [...m, { from:"ai", text:"Sorry, I couldn't connect to the AI right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Gemini AI Assistant</p>
              <p className="text-indigo-200 text-xs">Always here to help</p>
            </div>
          </div>
          {/* Messages */}
          <div className="h-60 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed
                  ${m.from === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-700 rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-3 py-2 rounded-xl text-sm text-slate-400">Thinking…</div>
              </div>
            )}
          </div>
          {/* Input */}
          <div className="px-3 py-2 border-t border-slate-100 flex gap-2">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask anything…"
              className="flex-1 text-sm px-3 py-2 bg-slate-50 rounded-xl focus:outline-none focus:bg-slate-100"
            />
            <button onClick={send}
              className="px-3 py-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white z-50 hover:scale-105 transition-transform"
        style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 32px rgba(99,102,241,0.45)" }}>
        {open ? "✕" : <Flame size={22} />}
      </button>
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────
export default function MockTest() {
  const [phase,     setPhase]     = useState(PHASES.ENTER);
  const [testId,    setTestId]    = useState(null);
  const [questions, setQuestions] = useState([]);
  const [result,    setResult]    = useState(null);

  const handleStart = (id, qs) => {
    setTestId(id);
    setQuestions(qs);
    setPhase(PHASES.TESTING);
  };

  const handleSubmit = (res) => {
    setResult(res);
    setPhase(PHASES.RESULT);
  };

  const handleRetry = () => {
    setPhase(PHASES.ENTER);
    setResult(null);
    setQuestions([]);
  };

  return (
    <div>
      {phase === PHASES.ENTER   && <EnterTestId onStart={handleStart} />}
      {phase === PHASES.TESTING && <TakeTest testId={testId} questions={questions} onSubmit={handleSubmit} />}
      {phase === PHASES.RESULT  && <Result result={result} onRetry={handleRetry} />}
      <AIAssistant />
    </div>
  );
}
