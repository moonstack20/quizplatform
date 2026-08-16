import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchStudentStats, fetchMyAttempts } from "../../api/attempts";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [statsData, attemptsData] = await Promise.all([
        fetchStudentStats(),
        fetchMyAttempts(),
      ]);
      setStats(statsData);
      setAttempts(attemptsData.attempts.filter((a) => a.status !== "IN_PROGRESS"));
      setLoading(false);
    };
    load();
  }, []);

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

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <StatCard label="Quizzes Attempted" value={stats.quizzes_attempted} />
                <StatCard label="Passed" value={stats.quizzes_passed} />
                <StatCard label="Failed" value={stats.quizzes_failed} />
                <StatCard label="Average Score" value={`${stats.average_score}%`} />
                <StatCard label="Highest Score" value={`${stats.highest_score}%`} />
                <StatCard label="Questions Answered" value={stats.total_questions_answered} />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Attempts</h2>

              {attempts.length === 0 ? (
                <p className="text-slate-500 text-sm">No attempts yet. Take a quiz to see your history here.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a.id} className="border-b border-slate-100">
                        <td className="py-2 text-slate-500">
                          {new Date(a.completed_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 font-medium">{a.percentage}%</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              a.status === "PASSED"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2">
                          <Link to={`/quizzes/result/${a.id}`} className="text-slate-600 hover:underline">
                            View Result
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
