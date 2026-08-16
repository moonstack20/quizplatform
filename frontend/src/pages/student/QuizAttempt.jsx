import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchAttempt, saveAnswer, submitAttempt, recordTabSwitch } from "../../api/quizzes";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function QuizAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const submittedRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await submitAttempt(attemptId);
      navigate(`/quizzes/result/${attemptId}`);
    } catch (err) {
      submittedRef.current = false;
      setSubmitting(false);
      alert(err.response?.data?.error || "Could not submit quiz.");
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAttempt(attemptId);
      setQuiz(data.quiz);
      setQuestions(data.questions);
      setAnswers(data.answers || {});

      const expiresAt = new Date(data.attempt.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setSecondsLeft(remaining);

      setLoading(false);
    };
    load();
  }, [attemptId]);

  // Flag when the student switches tabs or minimizes the window mid-quiz
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        setTabSwitches((prev) => prev + 1);
        recordTabSwitch(attemptId).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attemptId]);

  // Countdown timer — the backend is still the source of truth on submit;
  // this just drives the UI and triggers auto-submit when it hits zero.
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (secondsLeft === 0) {
      handleSubmit();
    }
  }, [secondsLeft, handleSubmit]);

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

  const handleManualSubmit = () => {
    if (answeredCount < questions.length) {
      if (!confirm(`You've answered ${answeredCount} of ${questions.length} questions. Submit anyway?`)) {
        return;
      }
    }
    handleSubmit();
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

  const timeCritical = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-slate-800">{quiz?.title}</h1>
          <div className="flex items-center gap-4">
            <span
              className={`font-mono text-sm px-3 py-1 rounded ${
                timeCritical ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
              }`}
            >
              {secondsLeft !== null ? formatTime(secondsLeft) : "--:--"}
            </span>
            <Link to="/quizzes" className="text-sm text-slate-500 hover:text-slate-800 underline">
              Exit
            </Link>
          </div>
        </div>

        {tabSwitches > 0 && (
          <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
            Tab switch detected ({tabSwitches}x). This is being recorded.
          </div>
        )}

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
              onClick={handleManualSubmit}
              disabled={submitting}
              className="px-4 py-2 text-sm bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizAttempt;
