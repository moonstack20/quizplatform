import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchAttempt, saveAnswer } from "../../api/quizzes";

function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAttempt(attemptId);
      setQuiz(data.quiz);
      setQuestions(data.questions);
      setAnswers(data.answers || {});
      setLoading(false);
    };
    load();
  }, [attemptId]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = async (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    setSaving(true);
    try {
      await saveAnswer(attemptId, currentQuestion.id, optionId);
    } finally {
      setSaving(false);
    }
  };

  const goTo = (index) => setCurrentIndex(index);
  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  const goPrevious = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const answeredCount = Object.values(answers).filter(Boolean).length;

  const handleSubmit = () => {
    // Real scoring + submission wired in on Day 8.
    // For now this just confirms all answers have been saved.
    if (answeredCount < questions.length) {
      if (!confirm(`You've answered ${answeredCount} of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }
    alert("Submission and scoring will be wired up tomorrow (Day 8). Your answers are saved.");
    navigate("/quizzes");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">No questions found for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-slate-800">{quiz?.title}</h1>
          <Link to="/quizzes" className="text-sm text-slate-500 hover:text-slate-800 underline">
            Exit
          </Link>
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => goTo(i)}
              className={`w-8 h-8 rounded text-xs font-medium border ${
                i === currentIndex
                  ? "bg-slate-800 text-white border-slate-800"
                  : answers[q.id]
                  ? "bg-green-100 text-green-700 border-green-300"
                  : "bg-white text-slate-500 border-slate-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <p className="text-sm text-slate-400 mb-2">
            Question {currentIndex + 1} of {questions.length} · {currentQuestion.marks} mark(s)
          </p>
          <h2 className="text-lg font-medium text-slate-800 mb-4">{currentQuestion.question_text}</h2>

          <div className="space-y-2">
            {currentQuestion.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 border rounded px-4 py-3 cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === opt.id
                    ? "border-slate-800 bg-slate-50"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] === opt.id}
                  onChange={() => handleSelect(opt.id)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-800">{opt.option_text}</span>
              </label>
            ))}
          </div>

          {saving && <p className="text-xs text-slate-400 mt-3">Saving...</p>}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40"
          >
            Previous
          </button>

          <p className="text-sm text-slate-500">
            {answeredCount} of {questions.length} answered
          </p>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={goNext}
              className="px-4 py-2 text-sm bg-slate-800 text-white rounded hover:bg-slate-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-800"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizAttempt;
