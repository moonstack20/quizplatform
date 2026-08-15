import apiClient from "./client";

export async function fetchQuestions(quizId) {
  const res = await apiClient.get(`/quizzes/${quizId}/questions`);
  return res.data;
}

export async function createQuestion(quizId, payload) {
  const res = await apiClient.post(`/quizzes/${quizId}/questions`, payload);
  return res.data;
}

export async function updateQuestion(questionId, payload) {
  const res = await apiClient.put(`/questions/${questionId}`, payload);
  return res.data;
}

export async function deleteQuestion(questionId) {
  const res = await apiClient.delete(`/questions/${questionId}`);
  return res.data;
}
