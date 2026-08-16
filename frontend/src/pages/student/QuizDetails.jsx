import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchQuiz, startAttempt } from "../../api/quizzes";
import { fetchCategories } from "../../api/categories";

function QuizDetails() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [categoryName, setCategoryName] = useState("General");
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [quizData, catData] = await Promise.all([
          fetchQuiz(quizId),
          fetchCategories(),
        ]);
        setQuiz(quizData.quiz);
        const cat = catData.categories.find((c) => c.id === quizData.quiz.category_id);
        if (cat) setCategoryName(cat.name);
      } catch (err) {
        setError("Quiz not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const data = await startAttempt(quizId);
      navigate(`/quizzes/attempt/${data.attempt.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not start quiz.");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">{error || "Quiz not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/quizzes" className="text-sm text-slate-500 hover:text-slate-800 underline">
          ← Back to Quizzes
        </Link>

        <div className="bg-white border border-slate-200 rounded-lg p-8 mt-4">
          <h1 className="text-2xl font-semibold text-slate-800">{quiz.title}</h1>
          <p className="text-slate-600 mt-2">{quiz.description}</p>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-slate-400">Category</p>
              <p className="font-medium text-slate-800">{categoryName}</p>
            </div>
            <div>
              <p className="text-slate-400">Difficulty</p>
              <p className="font-medium text-slate-800">{quiz.difficulty}</p>
            </div>
            <div>
              <p className="text-slate-400">Questions</p>
              <p className="font-medium text-slate-800">{quiz.question_count}</p>
            </div>
            <div>
              <p className="text-slate-400">Duration</p>
              <p className="font-medium text-slate-800">{quiz.duration_minutes} minutes</p>
            </div>
            <div>
              <p className="text-slate-400">Passing Score</p>
              <p className="font-medium text-slate-800">{quiz.passing_score}%</p>
            </div>
            <div>
              <p className="text-slate-400">Max Attempts</p>
              <p className="font-medium text-slate-800">{quiz.max_attempts}</p>
            </div>
          </div>

          {error && (
            <div className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={starting}
            className="mt-6 w-full bg-slate-800 text-white py-2.5 rounded hover:bg-slate-700 disabled:opacity-50"
          >
            {starting ? "Starting..." : "Start Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizDetails;
