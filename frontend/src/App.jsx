import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import CategoryManagement from "./pages/admin/CategoryManagement";
import QuizManagement from "./pages/admin/QuizManagement";


// Redirects a logged-in user to their role's dashboard; sends others to login
function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

// Day 4+: expand admin routes (/admin/users, /admin/quizzes, etc.)
// Day 7+: expand student routes (/quizzes, /attempts, /leaderboard, etc.)
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <CategoryManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/quizzes"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <QuizManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
