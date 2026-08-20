import apiClient from "./client";

export async function fetchLeaderboard(limit = 10) {
  const res = await apiClient.get("/leaderboard", { params: { limit } });
  return res.data;
}
