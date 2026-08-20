function Leaderboard({ data, currentUserId, title = "Leaderboard" }) {
    if (!data || data.length === 0) {
      return <p className="text-slate-500 text-sm">No ranked attempts yet.</p>;
    }
  
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="pb-2">Rank</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Attempts</th>
              <th className="pb-2">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isCurrentUser = currentUserId && row.user_id === currentUserId;
              return (
                <tr
                  key={row.user_id}
                  className={`border-b border-slate-100 ${isCurrentUser ? "bg-slate-50 font-medium" : ""}`}
                >
                  <td className="py-2 text-slate-500">#{row.rank}</td>
                  <td className="py-2 text-slate-800">
                    {row.name} {isCurrentUser && <span className="text-xs text-slate-400">(You)</span>}
                  </td>
                  <td className="py-2">{row.attempts_taken}</td>
                  <td className="py-2 font-medium">{row.average_score}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default Leaderboard;
  