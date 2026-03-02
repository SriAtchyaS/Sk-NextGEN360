import axios from "axios";

// ─── Base Instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ─── JWT Interceptor ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth  →  /api/auth ───────────────────────────────────────────
// POST /api/auth/login        { email, password }  → { token, role, name }
// POST /api/auth/register     { name, email, password, role, department, manager_id }
export const authAPI = {
  login:    (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// ─── Fresher  →  /api/fresher ────────────────────────────────────
// GET  /api/fresher/tasks                           → tasks[]
// POST /api/fresher/start-topic    { topic_id }
// POST /api/fresher/complete-topic { topic_id, notes }
// POST /api/fresher/calculate-score
// POST /api/fresher/submit-simulation { simulation_id, submission_url }
export const fresherAPI = {
  getMyTasks:         ()     => api.get("/fresher/tasks"),
  startTopic:         (data) => api.post("/fresher/start-topic", data),
  completeTopic:      (data) => api.post("/fresher/complete-topic", data),
  calculateScore:     ()     => api.post("/fresher/calculate-score"),
  submitSimulation:   (data) => api.post("/fresher/submit-simulation", data),
};

// ─── Mock Test  →  /api/mock-test ────────────────────────────────
// POST /api/mock-test/create   { topic, questions[20] }   (manager)
// GET  /api/mock-test/start/:testId                        → questions[10]
// POST /api/mock-test/submit   { testId, answers[] }      → { score }
export const mockTestAPI = {
  create: (data)   => api.post("/mock-test/create", data),
  start:  (testId) => api.get(`/mock-test/start/${testId}`),
  submit: (data)   => api.post("/mock-test/submit", data),
};

// ─── Manager  →  /api/manager ────────────────────────────────────
// POST /api/manager/add-question   { department, question, option_a..d, correct_option }
// GET  /api/manager/random-questions?department=Engineering
// POST /api/manager/submit-test    { answers[{ question_id, selected }] }
export const managerAPI = {
  addQuestion:      (data)       => api.post("/manager/add-question", data),
  getRandomQuestions: (dept)     => api.get(`/manager/random-questions?department=${dept}`),
  submitTest:       (data)       => api.post("/manager/submit-test", data),
};

// ─── Admin  →  /api/admin ────────────────────────────────────────
// POST /api/admin/create-user  { name, email, password, role, department, manager_id }
// GET  /api/admin/users                             → users[]
// GET  /api/admin/dashboard                         → stats
export const adminAPI = {
  createUser:    (data) => api.post("/admin/create-user", data),
  getAllUsers:   ()     => api.get("/admin/users"),
  getDashboard: ()     => api.get("/admin/dashboard"),
};

// ─── Tasks  →  /api/tasks ────────────────────────────────────────
// PUT /api/tasks/complete/:taskId
export const taskAPI = {
  markComplete: (taskId) => api.put(`/tasks/complete/${taskId}`),
};

// ─── AI  →  /api/ai ──────────────────────────────────────────────
// POST /api/ai/ask  { prompt }  → { reply }
export const aiAPI = {
  ask: (prompt) => api.post("/ai/ask", { prompt }),
};

// ─── Dashboard (protected ping)  →  /api/dashboard ───────────────
// GET /api/dashboard/admin | /api/dashboard/manager | /api/dashboard/fresher
export const dashboardAPI = {
  ping: (role) => api.get(`/dashboard/${role}`),
};

// ─── Manager - get freshers assigned to them ──────────────────────
// Uses admin/users endpoint and filters by manager_id on frontend
// since backend doesn't have a dedicated manager/freshers route
export const managerFresherAPI = {
  getMyFreshers: () => api.get("/admin/users"),
};

// ─── Review Session (email scheduling) ───────────────────────────
// POST /api/ai/ask used to send review request context
// The actual email is triggered via backend task completion
// We use a custom review-request email via nodemailer through AI route
export const reviewAPI = {
  scheduleReview: (data) => api.post("/ai/ask", {
    prompt: `[REVIEW_REQUEST] Fresher: ${data.fresherName}, Manager Email: ${data.managerEmail}, Requested Date: ${data.date}, Message: ${data.message}`
  }),
};
