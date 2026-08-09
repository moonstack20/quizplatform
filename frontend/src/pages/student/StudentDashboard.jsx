import { useAuth } from "../../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Student Dashboard</h1>
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800 underline">
            Log out
          </button>
        </div>
        <p className="text-slate-600">Welcome, {user.name}. Quiz listing and history build out on Day 7-9.</p>
      </div>
    </div>
  );
}

export default StudentDashboard;
