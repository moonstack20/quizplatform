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
export async function fetchCategoryStats() {
    const res = await apiClient.get("/attempts/stats/by-category");
    return res.data;
  }
export async function generateExplanation(questionId) {
    const res = await apiClient.post(`/questions/${questionId}/explain`);
    return res.data;
  }