import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAttemptReview } from "../../api/attempts";

function QuizResult() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchAttemptReview(attemptId);
      setData(result);
      setLoading(false);
    };
    load();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const { attempt, quiz_title, review } = data;
  const passed = attempt.status === "PASSED";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 underline">
          ← Back to Dashboard
        </Link>

        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center mt-4">
          <p className="text-sm text-slate-400 mb-1">{quiz_title}</p>
          <p className={`text-3xl font-bold ${passed ? "text-green-700" : "text-red-600"}`}>
            {attempt.percentage}%
          </p>
          <p className={`mt-1 font-medium ${passed ? "text-green-700" : "text-red-600"}`}>
            {attempt.status}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div>
              <p className="text-slate-400">Correct</p>
              <p className="font-semibold text-slate-800">{attempt.correct_answers}</p>
            </div>
            <div>
              <p className="text-slate-400">Incorrect</p>
              <p className="font-semibold text-slate-800">{attempt.incorrect_answers}</p>
            </div>
            <div>
              <p className="text-slate-400">Unanswered</p>
              <p className="font-semibold text-slate-800">{attempt.unanswered}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Time taken: {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
          </p>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mt-8 mb-4">Answer Review</h2>

        <div className="space-y-4">
          {review.map((q, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-medium text-slate-800">
                  {idx + 1}. {q.question_text}
                </p>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                    q.is_correct
                      ? "bg-green-100 text-green-700"
                      : q.is_correct === false
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {q.is_correct ? "Correct" : q.is_correct === false ? "Incorrect" : "Skipped"}
                </span>
              </div>

              <ul className="mt-3 space-y-1.5 text-sm">
                {q.options.map((o) => (
                  <li
                    key={o.id}
                    className={`px-3 py-1.5 rounded ${
                      o.is_correct
                        ? "bg-green-50 text-green-700 font-medium"
                        : o.was_selected
                        ? "bg-red-50 text-red-700"
                        : "text-slate-500"
                    }`}
                  >
                    {o.is_correct ? "✓ " : o.was_selected ? "✗ " : "— "}
                    {o.option_text}
                    {o.was_selected && !o.is_correct && (
                      <span className="text-xs ml-1">(your answer)</span>
                    )}
                  </li>
                ))}
              </ul>

              {q.explanation && (
                <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded px-3 py-2">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <Link
          to="/quizzes"
          className="mt-6 inline-block bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700"
        >
          Back to Quizzes
        </Link>
      </div>
    </div>
  );
}

export default QuizResult;
