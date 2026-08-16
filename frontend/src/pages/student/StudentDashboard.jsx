import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/quizzes" className="text-sm text-slate-600 hover:underline">
              Browse Quizzes
            </Link>
            <span className="text-sm text-slate-500">{user.name}</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800 underline">
              Log out
            </button>
          </div>
        </div>
        <p className="text-slate-600">Welcome, {user.name}. Statistics and quiz history build out on Day 9-10.</p>
      </div>
    </div>
  );
}

export default StudentDashboard;
