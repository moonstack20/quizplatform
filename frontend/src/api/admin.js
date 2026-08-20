import apiClient from "./client";

export async function fetchQuizAnalytics() {
  const res = await apiClient.get("/admin/analytics");
  return res.data;
}
