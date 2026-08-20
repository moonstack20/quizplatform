import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from "../../api/questions";
import { fetchQuiz } from "../../api/quizzes";
import ConfirmDialog from "../../components/ConfirmDialog";

const emptyOptions = [
  { option_text: "", is_correct: true },
  { option_text: "", is_correct: false },
  { option_text: "", is_correct: false },
  { option_text: "", is_correct: false },
];

const emptyForm = {
  question_text: "",
  marks: 1,
  explanation: "",
  difficulty: "EASY",
  options: emptyOptions,
};

function QuestionManagement() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const [quizData, questionsData] = await Promise.all([
      fetchQuiz(quizId),
      fetchQuestions(quizId),
    ]);
    setQuiz(quizData.quiz);
    setQuestions(questionsData.questions);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const resetForm = () => {
    setForm(JSON.parse(JSON.stringify(emptyForm)));
    setEditingId(null);
    setError("");
  };

  const handleOptionTextChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], option_text: value };
    setForm({ ...form, options: newOptions });
  };

  const handleCorrectChange = (index) => {
    const newOptions = form.options.map((o, i) => ({ ...o, is_correct: i === index }));
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateQuestion(editingId, form);
      } else {
        await createQuestion(quizId, form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setForm({
      question_text: q.question_text,
      marks: q.marks,
      explanation: q.explanation || "",
      difficulty: q.difficulty,
      options: q.options.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })),
    });
  };

  const handleDeleteClick = (q) => {
    setDeleteTarget(q);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuestion(deleteTarget.id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete question");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Questions {quiz && `— ${quiz.title}`}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{questions.length} question(s)</p>
          </div>
          <Link to="/admin/quizzes" className="text-sm text-slate-500 hover:text-slate-800 underline">
            Back to Quizzes
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? "Edit Question" : "New Question"}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
            <textarea
              required
              rows={2}
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Options (select the correct one)
            </label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={opt.is_correct}
                    onChange={() => handleCorrectChange(i)}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    required
                    placeholder={`Option ${i + 1}`}
                    value={opt.option_text}
                    onChange={(e) => handleOptionTextChange(i, e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
              <input
                type="number"
                min={1}
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Explanation (optional)</label>
            <textarea
              rows={2}
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700">
              {editingId ? "Save Changes" : "Add Question"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-800">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-slate-500 text-sm">No questions yet.</p>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-slate-800">
                    {idx + 1}. {q.question_text}
                  </p>
                  <div className="flex gap-3 text-sm shrink-0 ml-4">
                    <button onClick={() => handleEdit(q)} className="text-slate-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(q)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.options.map((o) => (
                    <li key={o.id} className={o.is_correct ? "text-green-700 font-medium" : "text-slate-500"}>
                      {o.is_correct ? "✓ " : "— "}
                      {o.option_text}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 mt-2">
                  {q.marks} mark(s) · {q.difficulty}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete question?"
        message="This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default QuestionManagement;