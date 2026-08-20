import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function QuizAnalyticsChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-slate-500 text-sm">No quiz data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="title" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
        <Tooltip
          contentStyle={{ fontSize: 13, borderRadius: 8, borderColor: "#e2e8f0" }}
          labelStyle={{ color: "#1e293b", fontWeight: 600 }}
        />
        <Bar dataKey="attempts" fill="#334155" name="Attempts" radius={[4, 4, 0, 0]} />
        <Bar dataKey="average_score" fill="#94a3b8" name="Avg Score (%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default QuizAnalyticsChart;
