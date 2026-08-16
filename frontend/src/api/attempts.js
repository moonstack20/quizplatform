import apiClient from "./client";

export async function fetchStudentStats() {
  const res = await apiClient.get("/attempts/stats/dashboard");
  return res.data;
}

export async function fetchMyAttempts() {
  const res = await apiClient.get("/attempts");
  return res.data;
}

export async function fetchAttemptReview(attemptId) {
  const res = await apiClient.get(`/attempts/${attemptId}/review`);
  return res.data;
}
