import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchQuizzes } from "../../api/quizzes";
import { fetchCategories } from "../../api/categories";
import Brand from "../../components/Brand";

const DIFFICULTY_STYLES = {
  BEGINNER: { label: "🟢 Beginner", classes: "bg-green-100 text-green-700" },
  INTERMEDIATE: { label: "🟡 Intermediate", classes: "bg-yellow-100 text-yellow-700" },
  ADVANCED: { label: "🔴 Advanced", classes: "bg-red-100 text-red-700" },
};

function DifficultyBadge({ difficulty }) {
  const style = DIFFICULTY_STYLES[difficulty] || { label: difficulty, classes: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style.classes}`}>
      {style.label}
    </span>
  );
}

function QuizListing() {
  const { user, logout } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category_id = categoryFilter;
    if (difficultyFilter) params.difficulty = difficultyFilter;

    const [quizData, catData] = await Promise.all([
      fetchQuizzes(params),
      fetchCategories(),
    ]);
    setQuizzes(quizData.quizzes);
    setCategories(catData.categories);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "General";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brand size="sm" />
            <span className="text-slate-300">|</span>
            <h1 className="text-xl font-semibold text-slate-800">Available Quizzes</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-sm text-slate-600 hover:underline">
              Dashboard
            </Link>
            <span className="text-sm text-slate-500">{user.name}</span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-800 underline">
              Log out
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search quizzes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded text-sm hover:bg-brand-700">
            Search
          </button>
        </form>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : quizzes.length === 0 ? (
          <p className="text-slate-500 text-sm">No quizzes found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quizzes/${quiz.id}`}
                className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-400 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                  <DifficultyBadge difficulty={quiz.difficulty} />
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span>{categoryName(quiz.category_id)}</span>
                  <span>·</span>
                  <span>{quiz.duration_minutes} min</span>
                  <span>·</span>
                  <span>{quiz.question_count} questions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizListing;
