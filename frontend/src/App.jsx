import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function Home() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800">Quiz Platform</h1>
        {user ? (
          <div className="mt-4">
            <p className="text-slate-600">
              Logged in as <span className="font-medium">{user.name}</span> ({user.role})
            </p>
            <button
              onClick={logout}
              className="mt-3 text-sm text-slate-500 hover:text-slate-800 underline"
            >
              Log out
            </button>
          </div>
        ) : (
          <p className="mt-2 text-slate-500">
            Not logged in.{" "}
            <a href="/login" className="text-slate-800 font-medium hover:underline">
              Log in
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

// Day 3+: replace with real routes (/admin/*, /dashboard, /quizzes, etc.) and protected routing
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
