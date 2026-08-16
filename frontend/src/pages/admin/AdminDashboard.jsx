import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchDashboardStats, fetchUsers, updateUserStatus, deleteUser } from "../../api/users";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        fetchDashboardStats(),
        fetchUsers(search),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    loadData();
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    await updateUserStatus(u.id, newStatus);
    loadData();
  };

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    await deleteUser(u.id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link to="/admin/categories" className="text-sm text-slate-600 hover:underline">
              Categories
            </Link>
            <Link to="/admin/quizzes" className="text-sm text-slate-600 hover:underline">
              Quizzes
            </Link>
            <span className="text-sm text-slate-500">{user.name}</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800 underline">
              Log out
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Students" value={stats.total_students} />
            <StatCard label="Total Quizzes" value={stats.total_quizzes} />
            <StatCard label="Published" value={stats.published_quizzes} />
            <StatCard label="Draft" value={stats.draft_quizzes} />
            <StatCard label="Total Questions" value={stats.total_questions} />
            <StatCard label="Total Attempts" value={stats.total_attempts} />
            <StatCard label="Average Score" value={`${stats.average_score}%`} />
            <StatCard label="Passed / Failed" value={`${stats.passed_attempts} / ${stats.failed_attempts}`} />
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Students</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button type="submit" className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-500 text-sm">No students found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Attempted</th>
                  <th className="pb-2">Avg Score</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-2">
                      <Link to={`/admin/users/${u.id}`} className="text-slate-800 hover:underline">
                        {u.name}
                      </Link>
                    </td>
                    <td className="py-2 text-slate-500">{u.email}</td>
                    <td className="py-2">{u.quizzes_attempted}</td>
                    <td className="py-2">{u.average_score !== null ? `${u.average_score}%` : "—"}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-2 space-x-3">
                      <button onClick={() => handleToggleStatus(u)} className="text-slate-600 hover:underline">
                        {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(u)} className="text-red-600 hover:underline">
                        Delete
                      </button>
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

export default AdminDashboard;
