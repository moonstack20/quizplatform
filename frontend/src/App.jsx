import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import apiClient from "./api/client";

function HealthCheck() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    apiClient
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-slate-800">Quiz Platform</h1>
        <p className="mt-2 text-slate-500">
          Backend status: <span className="font-mono">{status}</span>
        </p>
      </div>
    </div>
  );
}

// Day 2+: replace with real routes (/login, /register, /admin/*, /dashboard, /quizzes, etc.)
function App() {
  return (
    <Routes>
      <Route path="/" element={<HealthCheck />} />
    </Routes>
  );
}

export default App;
