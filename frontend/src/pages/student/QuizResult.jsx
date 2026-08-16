import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../api/client";

function QuizResult() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await apiClient.get(`/attempts/${attemptId}`);
      setAttempt(res.data.attempt);
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

  const passed = attempt.status === "PASSED";

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
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

          <Link
            to="/quizzes"
            className="mt-6 inline-block bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-700"
          >
            Back to Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QuizResult;
