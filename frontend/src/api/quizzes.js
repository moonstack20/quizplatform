import apiClient from "./client";

export async function fetchQuizzes(params = {}) {
  const res = await apiClient.get("/quizzes", { params });
  return res.data;
}

export async function fetchQuiz(id) {
  const res = await apiClient.get(`/quizzes/${id}`);
  return res.data;
}

export async function createQuiz(payload) {
  const res = await apiClient.post("/quizzes", payload);
  return res.data;
}

export async function updateQuiz(id, payload) {
  const res = await apiClient.put(`/quizzes/${id}`, payload);
  return res.data;
}

export async function deleteQuiz(id) {
  const res = await apiClient.delete(`/quizzes/${id}`);
  return res.data;
}

export async function togglePublish(id, status) {
  const res = await apiClient.patch(`/quizzes/${id}/publish`, { status });
  return res.data;
}
