import { useState, useEffect } from "react";
import { CheckCircle, Clock, BookOpen, FileText, Award, ArrowLeft, PlayCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function FresherTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [showMockTest, setShowMockTest] = useState(false);
  const [mockTestData, setMockTestData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/fresher/my-tasks");
      setTasks(data);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to mark this task as completed? You can then take the mock test.")) {
      return;
    }

    try {
      const { data } = await api.post(`/fresher/complete-task/${taskId}`);
      toast.success(data.message);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to complete task");
    }
  };

  const handleStartMockTest = async (taskId) => {
    try {
      const { data } = await api.get(`/mock-test/start-by-task/${taskId}`);
      setMockTestData(data);
      setShowMockTest(true);
      setAnswers({});
      setTestResult(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to start mock test");
    }
  };

  const handleSubmitMockTest = async () => {
    if (Object.keys(answers).length < mockTestData.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    try {
      const answersArray = mockTestData.questions.map((q) => ({
        question: q.question,
        selected: answers[q.id]
      }));

      const { data } = await api.post("/mock-test/submit", {
        task_id: mockTestData.task_id,
        answers: answersArray
      });

      setTestResult(data);
      toast.success(data.message);
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit test");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock Test View
  if (showMockTest && mockTestData) {
    if (testResult) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
            <Award size={64} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h2>
            <p className="text-gray-600 mb-6">Here are your results</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Questions</p>
                <p className="text-3xl font-bold text-blue-700">{testResult.total_questions}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Correct Answers</p>
                <p className="text-3xl font-bold text-green-700">{testResult.correct_answers}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Score</p>
                <p className="text-3xl font-bold text-purple-700">{testResult.score.toFixed(1)}%</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowMockTest(false);
                setMockTestData(null);
                setTestResult(null);
              }}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Tasks
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mock Test</h2>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
              {Object.keys(answers).length} / {mockTestData.questions.length} answered
            </span>
          </div>

          <div className="space-y-6">
            {mockTestData.questions.map((question, idx) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {idx + 1}. {question.question}
                </h3>
                <div className="space-y-3">
                  {['a', 'b', 'c', 'd'].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        answers[question.id] === option.toUpperCase()
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.toUpperCase()}
                        checked={answers[question.id] === option.toUpperCase()}
                        onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-gray-700">
                        <strong className="text-indigo-600">{option.toUpperCase()}.</strong> {question[`option_${option}`]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel? Your progress will be lost.")) {
                  setShowMockTest(false);
                  setMockTestData(null);
                }
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitMockTest}
              disabled={Object.keys(answers).length < mockTestData.questions.length}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Task Detail View
  if (viewingTask) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => setViewingTask(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          Back to All Tasks
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{viewingTask.topic}</h1>
              <p className="text-gray-600">Assigned by: {viewingTask.manager_name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Assigned on: {new Date(viewingTask.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              viewingTask.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {viewingTask.status === 'completed' ? 'Completed' : 'In Progress'}
            </span>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📚 What to do:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Study all the subtopics listed below</li>
              <li>Take your time to understand each concept</li>
              <li>When done, click "Mark as Completed" at the end of the day</li>
              <li>After completing, you can take the mock test</li>
            </ol>
          </div>

          {/* Subtopics */}
          {viewingTask.subtopics && viewingTask.subtopics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={24} />
                Subtopics to Study ({viewingTask.subtopics.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {viewingTask.subtopics.map((subtopic, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{subtopic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            {viewingTask.status === 'pending' && (
              <button
                onClick={() => {
                  handleCompleteTask(viewingTask.id);
                  setViewingTask(null);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <CheckCircle size={24} />
                Mark as Completed
              </button>
            )}
            {viewingTask.status === 'completed' && !viewingTask.mock_test_completed && (
              <button
                onClick={() => {
                  handleStartMockTest(viewingTask.id);
                  setViewingTask(null);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              >
                <Award size={24} />
                Take Mock Test
              </button>
            )}
            {viewingTask.mock_test_completed && (
              <div className="flex items-center gap-3 text-green-600 text-lg font-semibold">
                <CheckCircle size={24} />
                <span>Mock Test Completed ✓</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tasks List View
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">Click on a task to view details and start working</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No tasks assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setViewingTask(task)}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{task.topic}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Assigned by: {task.manager_name}</p>
                  {task.completed_at && (
                    <p className="text-sm text-gray-500 mt-1">
                      Completed: {new Date(task.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <PlayCircle size={32} className="text-indigo-500 flex-shrink-0" />
              </div>

              {/* Subtopics Preview */}
              {task.subtopics && task.subtopics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    {task.subtopics.length} Subtopics - Click to view details
                  </p>
                </div>
              )}

              {/* Status Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {task.status === 'pending' && (
                  <div className="flex items-center gap-2 text-yellow-600 font-medium">
                    <Clock size={18} />
                    Click to start working on this task
                  </div>
                )}
                {task.status === 'completed' && !task.mock_test_completed && (
                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    <Award size={18} />
                    Ready to take mock test
                  </div>
                )}
                {task.mock_test_completed && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle size={18} />
                    Completed with mock test
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
