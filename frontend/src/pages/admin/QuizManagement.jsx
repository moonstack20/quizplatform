import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchQuizzes, createQuiz, updateQuiz, deleteQuiz, togglePublish } from "../../api/quizzes";
import { fetchCategories } from "../../api/categories";

const emptyForm = {
  title: "",
  description: "",
  category_id: "",
  difficulty: "BEGINNER",
  duration_minutes: 10,
  passing_score: 60,
  max_attempts: 1,
};

function QuizManagement() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [quizData, catData] = await Promise.all([fetchQuizzes(), fetchCategories()]);
    setQuizzes(quizData.quizzes);
    setCategories(catData.categories);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        duration_minutes: Number(form.duration_minutes),
        passing_score: Number(form.passing_score),
        max_attempts: Number(form.max_attempts),
        category_id: form.category_id || null,
      };
      if (editingId) {
        await updateQuiz(editingId, payload);
      } else {
        await createQuiz(payload);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleEdit = (quiz) => {
    setEditingId(quiz.id);
    setForm({
      title: quiz.title,
      description: quiz.description || "",
      category_id: quiz.category_id || "",
      difficulty: quiz.difficulty,
      duration_minutes: quiz.duration_minutes,
      passing_score: quiz.passing_score,
      max_attempts: quiz.max_attempts,
    });
  };

  const handleDelete = async (quiz) => {
    if (!confirm(`Delete quiz "${quiz.title}"?`)) return;
    await deleteQuiz(quiz.id);
    load();
  };

  const handlePublishToggle = async (quiz) => {
    const newStatus = quiz.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
    try {
      await togglePublish(quiz.id, newStatus);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not update publish status");
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Quizzes</h1>
          <Link to="/admin/dashboard" className="text-sm text-slate-500 hover:text-slate-800 underline">
            Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? "Edit Quiz" : "New Quiz"}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                required
                value={form.duration_minutes}
                onChange={(e) => handleChange("duration_minutes", e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={form.passing_score}
                onChange={(e) => handleChange("passing_score", e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Attempts</label>
              <input
                type="number"
                min={1}
                required
                value={form.max_attempts}
                onChange={(e) => handleChange("max_attempts", e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700">
              {editingId ? "Save Changes" : "Create Quiz"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-800">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : quizzes.length === 0 ? (
            <p className="text-slate-500 text-sm">No quizzes yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Difficulty</th>
                  <th className="pb-2">Questions</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{quiz.title}</td>
                    <td className="py-2 text-slate-500">{categoryName(quiz.category_id)}</td>
                    <td className="py-2">{quiz.difficulty}</td>
                    <td className="py-2">{quiz.question_count}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          quiz.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : quiz.status === "DRAFT"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </td>
                    <td className="py-2 space-x-3">
                      <button onClick={() => handleEdit(quiz)} className="text-slate-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handlePublishToggle(quiz)} className="text-slate-600 hover:underline">
                        {quiz.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => handleDelete(quiz)} className="text-red-600 hover:underline">
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

export default QuizManagement;
