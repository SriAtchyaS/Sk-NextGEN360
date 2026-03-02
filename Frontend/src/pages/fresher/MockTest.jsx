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

// ─── Phase 1: Enter Fresher Name and Topic ───────────────────────
function EnterTestId({ onStart }) {
  const [fresherName, setFresherName] = useState("");
  const [topic,       setTopic]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  const handleStart = async () => {
    if (!fresherName.trim()) return setError("Please enter your name");
    if (!topic.trim()) return setError("Please enter the topic assigned to you");

    setLoading(true); setError("");
    try {
      // POST /api/mock-test/generate-quick-test
      const { data } = await mockTestAPI.generateQuickTest({
        fresher_name: fresherName,
        topic: topic
      });

      if (!data.questions || data.questions.length === 0)
        return setError("Could not generate questions. Try again.");

      onStart(fresherName, data.questions);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to generate test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <PageHeader title="Mock Test" subtitle="Enter your name and the topic assigned to you" />
      <Card>
        <div className="p-6 space-y-4">
          <Input
            label="Your Name"
            value={fresherName}
            onChange={e => setFresherName(e.target.value)}
            placeholder="e.g. John Doe"
          />
          <Input
            label="Topic Assigned to You"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. React Fundamentals"
          />
          {error && <Alert type="error" message={error} />}
          <Btn onClick={handleStart} disabled={loading} className="w-full" icon={Brain}>
            {loading ? "Generating 10 Questions with AI…" : "Generate Test"}
          </Btn>
          <p className="text-xs text-slate-400 text-center">
            AI will generate 10 questions based on your topic
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Phase 2: Take Test ───────────────────────────────────────────
function TakeTest({ fresherName, questions, onSubmit }) {
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState({});   // { questionIndex: "A"|"B"|"C"|"D" }
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
    setAnswers(prev => ({ ...prev, [current]: key }));
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");

    // Calculate score locally since we have the correct answers
    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        score++;
      }
    });

    const finalScore = (score / total) * 100;
    const result = {
      score: finalScore,
      totalQuestions: total,
      correctAnswers: score
    };

    onSubmit(result);
  };

  const answered = Object.keys(answers).length;
  const selected = answers[current];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mock Test - {fresherName}</p>
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
                : answers[i]
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

// ─── Main Export ──────────────────────────────────────────────────
export default function MockTest() {
  const [phase,       setPhase]       = useState(PHASES.ENTER);
  const [fresherName, setFresherName] = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [result,      setResult]      = useState(null);

  const handleStart = (name, qs) => {
    setFresherName(name);
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
    setFresherName(null);
  };

  return (
    <div>
      {phase === PHASES.ENTER   && <EnterTestId onStart={handleStart} />}
      {phase === PHASES.TESTING && <TakeTest fresherName={fresherName} questions={questions} onSubmit={handleSubmit} />}
      {phase === PHASES.RESULT  && <Result result={result} onRetry={handleRetry} />}
    </div>
  );
}
