import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUserAttempts } from "../../api/users";

function StudentDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchUserAttempts(userId);
      setUser(data.user);
      setAttempts(data.attempts);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-800 underline">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Attempt History</h2>

          {attempts.length === 0 ? (
            <p className="text-slate-500 text-sm">No attempts yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Correct</th>
                  <th className="pb-2">Tab Switches</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-2 text-slate-500">
                      {a.started_at ? new Date(a.started_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          a.status === "PASSED"
                            ? "bg-green-100 text-green-700"
                            : a.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2">{a.percentage !== null ? `${a.percentage}%` : "—"}</td>
                    <td className="py-2">
                      {a.correct_answers !== null ? a.correct_answers : "—"}
                    </td>
                    <td className="py-2">
                      {a.tab_switch_count > 0 ? (
                        <span className="text-yellow-700 font-medium">{a.tab_switch_count}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetail;
