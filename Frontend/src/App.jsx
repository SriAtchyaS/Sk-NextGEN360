import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Auth
import Login from "./pages/auth/LoginNew";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers     from "./pages/admin/Users";
import CreateUser     from "./pages/admin/CreateUser";

// Manager
import ManagerDashboard from "./pages/manager/Dashboard";
import AssignTask       from "./pages/manager/AssignTask";

// Fresher
import FresherDashboard from "./pages/fresher/Dashboard";
import FresherTasks     from "./pages/fresher/Tasks";
import MockTest         from "./pages/fresher/MockTest";

// ── Guards ────────────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <Layout>{children}</Layout>;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/"      element={<RoleRedirect />} />

          {/* Admin */}
          <Route path="/admin"             element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users"       element={<ProtectedRoute roles={["admin"]}><AdminUsers     /></ProtectedRoute>} />
          <Route path="/admin/create-user" element={<ProtectedRoute roles={["admin"]}><CreateUser     /></ProtectedRoute>} />

          {/* Manager */}
          <Route path="/manager"              element={<ProtectedRoute roles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/assign-task"  element={<ProtectedRoute roles={["manager"]}><AssignTask       /></ProtectedRoute>} />

          {/* Fresher */}
          <Route path="/fresher"            element={<ProtectedRoute roles={["fresher"]}><FresherDashboard /></ProtectedRoute>} />
          <Route path="/fresher/tasks"      element={<ProtectedRoute roles={["fresher"]}><FresherTasks     /></ProtectedRoute>} />
          <Route path="/fresher/mock-test"  element={<ProtectedRoute roles={["fresher"]}><MockTest         /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
