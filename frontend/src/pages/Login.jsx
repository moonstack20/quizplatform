import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError("That email or password doesn't look right. Please try again.");
      } else if (!err.response) {
        setError("Can't reach the server right now. Check your connection and try again.");
      } else {
        setError(err.response?.data?.error || "Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top: hero / feature banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-pink-400 text-white px-6 py-14">
        {/* subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* soft glow shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-pink-300/20 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-sm">📚 QuizSphere</p>
          <p className="text-lg font-medium text-brand-50 mb-1">
            Smart Online Quiz &amp; Assessment Platform
          </p>
          <p className="text-brand-50/90 mb-10">
            Test your knowledge. Track your progress.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl bg-white/15 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">⏱</span>
              <div>
                <p className="font-semibold text-sm">Timed Assessments</p>
                <p className="text-xs text-brand-50/80">Exam-style timing with auto-submit.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl bg-white/15 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">📊</span>
              <div>
                <p className="font-semibold text-sm">Track Progress</p>
                <p className="text-xs text-brand-50/80">Stats and performance by category.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl bg-white/15 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">🏆</span>
              <div>
                <p className="font-semibold text-sm">Leaderboard</p>
                <p className="text-xs text-brand-50/80">See how you rank against others.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl bg-white/15 rounded-lg w-11 h-11 flex items-center justify-center shrink-0">🎓</span>
              <div>
                <p className="font-semibold text-sm">Certificates</p>
                <p className="text-xs text-brand-50/80">Earn one when you pass a quiz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: login form */}
      {/* Bottom: login form */}
<div className="flex items-center justify-center px-4 py-12">
  <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-slate-200 p-8">
    <div className="flex items-center gap-2 mb-6">
      <span className="text-2xl">📚</span>
      <h1 className="text-2xl font-semibold text-slate-800">Log in</h1>
    </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 text-white py-2 rounded hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-500 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
